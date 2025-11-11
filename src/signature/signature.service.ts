import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { SignatureGenerationEvent, GenerationType } from '../entity/signature-generation-event.entity';
import { SignatureCode } from '../entity/signature-code.entity';
import { SignatureQR } from '../entity/signature-qr.entity';
import { SignatureQRActivation } from '../entity/signature-qr-activation.entity';
import { Webshop } from '../entity/webshop.entity';
import { User, UserRole } from '../entity/user.entity';
import { UserBalance } from '../entity/user-balance.entity';
import { WebshopPartner } from '../entity/webshop-partner.entity';
import { GenerateCodesDto } from '../dto/generate-codes.dto';
import { GenerateQRDto } from '../dto/generate-qr.dto';
import { AddBalanceDirectDto } from '../dto/add-balance-direct.dto';
import { RedeemCodeDto } from '../dto/redeem-code.dto';
import { RedeemQRDto } from '../dto/redeem-qr.dto';
import * as PDFDocument from 'pdfkit';
import * as QRCode from 'qrcode';

@Injectable()
export class SignatureService {
    constructor(
        @InjectRepository(SignatureGenerationEvent)
        private readonly eventRepository: Repository<SignatureGenerationEvent>,
        @InjectRepository(SignatureCode)
        private readonly codeRepository: Repository<SignatureCode>,
        @InjectRepository(SignatureQR)
        private readonly qrRepository: Repository<SignatureQR>,
        @InjectRepository(SignatureQRActivation)
        private readonly qrActivationRepository: Repository<SignatureQRActivation>,
        @InjectRepository(Webshop)
        private readonly webshopRepository: Repository<Webshop>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(UserBalance)
        private readonly balanceRepository: Repository<UserBalance>,
        @InjectRepository(WebshopPartner)
        private readonly partnerRepository: Repository<WebshopPartner>,
    ) { }

    // ==================== GENERÃLÃS ====================

    async generateCodes(userId: number, dto: GenerateCodesDto) {
        // Webshop validÃ¡lÃ¡s Ã©s jogosultsÃ¡g ellenÅ‘rzÃ©s
        const webshop = await this.validateWebshopAccess(userId, dto.webshopId);

        // Event lÃ©trehozÃ¡sa
        const event = this.eventRepository.create({
            webshop_id: dto.webshopId,
            teacher_id: userId,
            generation_type: GenerationType.CODE,
            total_codes: dto.count,
            code_value: dto.value,
            expiry_date: dto.expiryDate,
        });
        await this.eventRepository.save(event);

        // KÃ³dok generÃ¡lÃ¡sa
        const codes: SignatureCode[] = [];
        for (let i = 0; i < dto.count; i++) {
            const code = this.codeRepository.create({
                event_id: event.event_id,
                code: this.generateUniqueCode(),
            });
            codes.push(code);
        }
        await this.codeRepository.save(codes);

        // PDF generÃ¡lÃ¡s
        const pdfBuffer = await this.generateCodesPDF(codes, webshop, dto.value, dto.expiryDate);

        return {
            eventId: event.event_id,
            generatedCodes: codes.length,
            pdfBuffer,
        };
    }

    async generateQR(userId: number, dto: GenerateQRDto) {
        // Webshop validÃ¡lÃ¡s Ã©s jogosultsÃ¡g ellenÅ‘rzÃ©s
        const webshop = await this.validateWebshopAccess(userId, dto.webshopId);

        // Event lÃ©trehozÃ¡sa
        const event = this.eventRepository.create({
            webshop_id: dto.webshopId,
            teacher_id: userId,
            generation_type: GenerationType.QR,
            total_codes: 1,
            code_value: dto.value,
            expiry_date: dto.expiryDate,
        });
        await this.eventRepository.save(event);

        // QR data generÃ¡lÃ¡s (egyedi azonosÃ­tÃ³)
        const qrData = `SIGNATURE_QR_${event.event_id}_${Date.now()}`;

        // QR entitÃ¡s lÃ©trehozÃ¡sa
        const qr = this.qrRepository.create({
            event_id: event.event_id,
            qr_data: qrData,
            max_activations: dto.maxActivations,
            current_activations: 0,
            is_active: true,
        });
        await this.qrRepository.save(qr);

        // QR kÃ©p generÃ¡lÃ¡s
        const pngBuffer = await QRCode.toBuffer(qrData, {
            errorCorrectionLevel: 'H',
            type: 'png',
            width: 500,
            margin: 2,
        });

        return {
            qrId: qr.qr_id,
            eventId: event.event_id,
            pngBuffer,
        };
    }

    async addBalanceDirect(userId: number, dto: AddBalanceDirectDto) {
        // Webshop validÃ¡lÃ¡s Ã©s jogosultsÃ¡g ellenÅ‘rzÃ©s
        const webshop = await this.validateWebshopAccess(userId, dto.webshopId);

        // DiÃ¡k validÃ¡lÃ¡s
        const student = await this.userRepository.findOne({
            where: { user_id: dto.studentId, role: UserRole.STUDENT },
        });

        if (!student) {
            throw new NotFoundException('DiÃ¡k nem talÃ¡lhatÃ³');
        }

        // Event lÃ©trehozÃ¡sa (nyilvÃ¡ntartÃ¡s cÃ©ljÃ¡bÃ³l)
        const event = this.eventRepository.create({
            webshop_id: dto.webshopId,
            teacher_id: userId,
            generation_type: GenerationType.DIRECT,
            total_codes: 1,
            code_value: dto.amount,
            expiry_date: new Date(), // Azonnali, nincs lejÃ¡rat
        });
        await this.eventRepository.save(event);

        // Egyenleg frissÃ­tÃ©se
        await this.updateUserBalance(dto.studentId, dto.webshopId, dto.amount);

        return {
            message: 'Egyenleg sikeresen hozzÃ¡adva',
            student: student.username,
            amount: dto.amount,
            webshop: webshop.subject_name,
        };
    }

    // ==================== BEVÃLTÃS ====================

    async redeemCode(userId: number, dto: RedeemCodeDto) {
        // KÃ³d lekÃ©rdezÃ©se a kapcsolatokkal egyÃ¼tt
        const code = await this.codeRepository.findOne({
            where: {
                code: dto.code,
                is_redeemed: false,
            },
            relations: ['event', 'event.webshop'],
        });

        if (!code) {
            throw new NotFoundException('KÃ³d nem talÃ¡lhatÃ³ vagy mÃ¡r bevÃ¡ltottÃ¡k');
        }

        // LejÃ¡rat ellenÅ‘rzÃ©se
        if (new Date(code.event.expiry_date) < new Date()) {
            throw new BadRequestException('A kÃ³d lejÃ¡rt');
        }

        // WebshopId kinyerÃ©se a kapcsolatbÃ³l (ITT VOLT A HIBA!)
        const webshopId = code.event.webshop_id;

        // Egyenleg frissÃ­tÃ©se
        await this.updateUserBalance(userId, webshopId, Number(code.event.code_value));

        // KÃ³d megjelÃ¶lÃ©se bevÃ¡ltottkÃ©nt
        code.is_redeemed = true;
        code.redeemed_by = userId;
        code.redeemed_at = new Date();
        await this.codeRepository.save(code);

        return {
            message: 'KÃ³d sikeresen bevÃ¡ltva',
            addedAmount: code.event.code_value,
            webshop: code.event.webshop.subject_name,
        };
    }

    async redeemQR(userId: number, dto: RedeemQRDto) {
        // QR lekÃ©rdezÃ©se a kapcsolatokkal egyÃ¼tt
        const qr = await this.qrRepository.findOne({
            where: {
                qr_data: dto.qrData,
                is_active: true,
            },
            relations: ['event', 'event.webshop', 'activations'],
        });

        if (!qr) {
            throw new NotFoundException('QR kÃ³d nem talÃ¡lhatÃ³ vagy inaktÃ­v');
        }

        // LejÃ¡rat ellenÅ‘rzÃ©se
        if (new Date(qr.event.expiry_date) < new Date()) {
            throw new BadRequestException('A QR kÃ³d lejÃ¡rt');
        }

        // Max aktivÃ¡lÃ¡sok ellenÅ‘rzÃ©se
        if (qr.current_activations >= qr.max_activations) {
            throw new BadRequestException('A QR kÃ³d elÃ©rte a maximÃ¡lis aktivÃ¡lÃ¡sok szÃ¡mÃ¡t');
        }

        // DuplikÃ¡lt bevÃ¡ltÃ¡s ellenÅ‘rzÃ©se
        const alreadyRedeemed = qr.activations?.some(act => act.user_id === userId);
        if (alreadyRedeemed) {
            throw new BadRequestException('MÃ¡r bevÃ¡ltottad ezt a QR kÃ³dot');
        }

        // WebshopId kinyerÃ©se a kapcsolatbÃ³l (ITT VOLT A HIBA!)
        const webshopId = qr.event.webshop_id;

        // Egyenleg frissÃ­tÃ©se
        await this.updateUserBalance(userId, webshopId, Number(qr.event.code_value));

        // AktivÃ¡lÃ¡s rÃ¶gzÃ­tÃ©se
        const activation = this.qrActivationRepository.create({
            qr_id: qr.qr_id,
            user_id: userId,
        });
        await this.qrActivationRepository.save(activation);

        // QR aktivÃ¡lÃ¡sok szÃ¡mÃ¡nak nÃ¶velÃ©se
        qr.current_activations++;
        if (qr.current_activations >= qr.max_activations) {
            qr.is_active = false;
        }
        await this.qrRepository.save(qr);

        return {
            message: 'QR kÃ³d sikeresen bevÃ¡ltva',
            addedAmount: qr.event.code_value,
            webshop: qr.event.webshop.subject_name,
            remainingActivations: qr.max_activations - qr.current_activations,
        };
    }

    // ==================== LEKÃ‰RDEZÃ‰SEK ====================

    async getTeacherCodes(userId: number, webshopId?: number) {
        const where: any = { teacher_id: userId };
        if (webshopId) {
            where.webshop_id = webshopId;
        }

        const events = await this.eventRepository.find({
            where: { ...where, generation_type: GenerationType.CODE },
            relations: ['codes', 'webshop'],
            order: { created_at: 'DESC' },
        });

        return events.map(event => ({
            eventId: event.event_id,
            webshop: event.webshop.subject_name,
            totalCodes: event.total_codes,
            codeValue: event.code_value,
            expiryDate: event.expiry_date,
            createdAt: event.created_at,
            codes: event.codes.map(code => ({
                codeId: code.code_id,
                code: code.code,
                isRedeemed: code.is_redeemed,
                redeemedAt: code.redeemed_at,
                redeemedBy: code.redeemed_by,
            })),
        }));
    }

    async getTeacherQRs(userId: number, webshopId?: number) {
        const where: any = { teacher_id: userId };
        if (webshopId) {
            where.webshop_id = webshopId;
        }

        const events = await this.eventRepository.find({
            where: { ...where, generation_type: GenerationType.QR },
            relations: ['qrs', 'qrs.activations', 'webshop'],
            order: { created_at: 'DESC' },
        });

        return events.map(event => ({
            eventId: event.event_id,
            webshop: event.webshop.subject_name,
            codeValue: event.code_value,
            expiryDate: event.expiry_date,
            createdAt: event.created_at,
            qrs: event.qrs.map(qr => ({
                qrId: qr.qr_id,
                qrData: qr.qr_data,
                maxActivations: qr.max_activations,
                currentActivations: qr.current_activations,
                isActive: qr.is_active,
                activations: qr.activations?.length || 0,
            })),
        }));
    }

    async getAllStudents() {
        const students = await this.userRepository.find({
            where: { role: UserRole.STUDENT },
            select: ['user_id', 'username', 'email', 'created_at'],
            order: { username: 'ASC' },
        });

        return students;
    }

    // ==================== TÃ–RLÃ‰S ====================

    async deleteCode(userId: number, codeId: number) {
        const code = await this.codeRepository.findOne({
            where: { code_id: codeId },
            relations: ['event'],
        });

        if (!code) {
            throw new NotFoundException('KÃ³d nem talÃ¡lhatÃ³');
        }

        // JogosultsÃ¡g ellenÅ‘rzÃ©s
        await this.validateWebshopAccess(userId, code.event.webshop_id);

        if (code.is_redeemed) {
            throw new BadRequestException('BevÃ¡ltott kÃ³dot nem lehet tÃ¶rÃ¶lni');
        }

        await this.codeRepository.remove(code);

        return {
            message: 'KÃ³d sikeresen tÃ¶rÃ¶lve',
        };
    }

    async deleteQR(userId: number, qrId: number) {
        const qr = await this.qrRepository.findOne({
            where: { qr_id: qrId },
            relations: ['event', 'activations'],
        });

        if (!qr) {
            throw new NotFoundException('QR kÃ³d nem talÃ¡lhatÃ³');
        }

        // JogosultsÃ¡g ellenÅ‘rzÃ©s
        await this.validateWebshopAccess(userId, qr.event.webshop_id);

        if (qr.activations && qr.activations.length > 0) {
            throw new BadRequestException('MÃ¡r aktivÃ¡lt QR kÃ³dot nem lehet tÃ¶rÃ¶lni');
        }

        await this.qrRepository.remove(qr);

        return {
            message: 'QR kÃ³d sikeresen tÃ¶rÃ¶lve',
        };
    }

    // ==================== CLEANUP ====================

    async cleanupExpiredCodes() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // LejÃ¡rt kÃ³dok tÃ¶rlÃ©se (amelyek mÃ©g nem lettek bevÃ¡ltva)
        const expiredEvents = await this.eventRepository.find({
            where: {
                expiry_date: LessThan(today),
            },
            relations: ['codes', 'qrs'],
        });

        let deletedCodes = 0;
        let deletedQRs = 0;

        for (const event of expiredEvents) {
            // Nem bevÃ¡ltott kÃ³dok tÃ¶rlÃ©se
            if (event.codes) {
                const unredeemedCodes = event.codes.filter(c => !c.is_redeemed);
                if (unredeemedCodes.length > 0) {
                    await this.codeRepository.remove(unredeemedCodes);
                    deletedCodes += unredeemedCodes.length;
                }
            }

            // InaktÃ­v QR-ok tÃ¶rlÃ©se (ha nincs aktivÃ¡lÃ¡s)
            if (event.qrs) {
                for (const qr of event.qrs) {
                    const activationCount = await this.qrActivationRepository.count({
                        where: { qr_id: qr.qr_id },
                    });
                    if (activationCount === 0) {
                        await this.qrRepository.remove(qr);
                        deletedQRs++;
                    }
                }
            }
        }

        return { deletedCodes, deletedQRs };
    }

    // ==================== PRIVATE SEGÃ‰D METÃ“DUSOK ====================

    private async validateWebshopAccess(userId: number, webshopId: number): Promise<Webshop> {
        const webshop = await this.webshopRepository.findOne({
            where: { webshop_id: webshopId },
            relations: ['teacher'],
        });

        if (!webshop) {
            throw new NotFoundException('Webshop nem talÃ¡lhatÃ³');
        }

        // Admin mindenhez hozzÃ¡fÃ©r
        const user = await this.userRepository.findOne({ where: { user_id: userId } });
        if (user?.role === UserRole.ADMIN) {
            return webshop;
        }

        // Tulajdonos tanÃ¡r hozzÃ¡fÃ©r
        if (webshop.teacher_id === userId) {
            return webshop;
        }

        // Partner tanÃ¡r hozzÃ¡fÃ©r
        const isPartner = await this.partnerRepository.findOne({
            where: {
                webshop_id: webshopId,
                partner_teacher_id: userId,
            },
        });

        if (isPartner) {
            return webshop;
        }

        throw new ForbiddenException('Nincs jogosultsÃ¡god ehhez a webshop-hoz');
    }

    private async updateUserBalance(userId: number, webshopId: number, amount: number) {
        let balance = await this.balanceRepository.findOne({
            where: {
                user_id: userId,
                webshop_id: webshopId
            } as any,
        });

        if (!balance) {
            balance = this.balanceRepository.create({
                user_id: userId,
                webshop_id: webshopId,
                balance_amount: 0,
            });
        }

        balance.balance_amount = Number(balance.balance_amount) + amount;
        await this.balanceRepository.save(balance);
    }

    private generateUniqueCode(): string {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // KÃ¶nnyebben olvashatÃ³ karakterek
        let code = '';
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }

    private async generateCodesPDF(
        codes: SignatureCode[],
        webshop: Webshop,
        value: number,
        expiryDate: Date,
    ): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ size: 'A4', margin: 50 });
            const chunks: Buffer[] = [];

            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            // FejlÃ©c
            doc.fontSize(20).text(`${webshop.subject_name} - AlÃ¡Ã­rÃ¡s KÃ³dok`, { align: 'center' });
            doc.moveDown();
            doc.fontSize(12).text(`Ã‰rtÃ©k: ${value} ${webshop.paying_instrument}`);
            doc.text(`LejÃ¡rat: ${expiryDate.toLocaleDateString('hu-HU')}`);
            doc.text(`GenerÃ¡lt kÃ³dok szÃ¡ma: ${codes.length}`);
            doc.moveDown(2);

            // KÃ³dok tÃ¡blÃ¡zat
            codes.forEach((code, index) => {
                if (index > 0 && index % 20 === 0) {
                    doc.addPage();
                }
                doc.fontSize(14).text(`${index + 1}. ${code.code}`, { continued: false });
            });

            doc.end();
        });
    }
}