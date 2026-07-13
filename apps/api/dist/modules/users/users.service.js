"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./entities/user.entity");
const user_role_enum_1 = require("../../common/enums/user-role.enum");
const verification_status_enum_1 = require("../../common/enums/verification-status.enum");
const document_entity_1 = require("../documents/entities/document.entity");
const artisan_entity_1 = require("../artisans/entities/artisan.entity");
let UsersService = class UsersService {
    constructor(usersRepo, docsRepo, artisansRepo) {
        this.usersRepo = usersRepo;
        this.docsRepo = docsRepo;
        this.artisansRepo = artisansRepo;
    }
    async findById(id) {
        const user = await this.usersRepo.findOne({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return user;
    }
    async findByEmail(email) {
        return this.usersRepo.findOne({ where: { email } });
    }
    /** Liste des agences / entreprises BTP auxquelles un artisan peut s'affilier. */
    async findAgencies() {
        const rows = await this.usersRepo.find({
            where: [{ role: user_role_enum_1.UserRole.AGENCE_HOTE }, { role: user_role_enum_1.UserRole.ENTREPRISE_BTP }],
            order: { agencyName: 'ASC' },
        });
        return rows.map(u => ({
            id: u.id,
            name: u.agencyName || `${u.firstName} ${u.lastName}`.trim() || 'Agence',
            city: u.city,
            role: u.role,
        }));
    }
    async updateProfile(id, updates) {
        // Ne garder que les champs autorisés et définis
        const allowed = [
            'firstName', 'lastName', 'avatarUrl', 'phone', 'city', 'address',
            'agencyName', 'shopName', 'specialty', 'description',
            'payoutMethod', 'payoutNumber',
        ];
        const clean = {};
        for (const k of allowed) {
            const v = updates[k];
            if (v !== undefined)
                clean[k] = v;
        }
        if (Object.keys(clean).length) {
            await this.usersRepo.update(id, clean);
        }
        return this.findById(id);
    }
    /**
     * Bascule le rôle actif entre CLIENT (compte standard) et un rôle pro déjà
     * activé. Les infos pro (spécialité, nom, documents) restent en base, donc
     * l'utilisateur peut revenir en mode pro sans rien ressaisir.
     */
    async switchRole(id, role) {
        const allowed = [
            user_role_enum_1.UserRole.CLIENT, user_role_enum_1.UserRole.ARTISAN, user_role_enum_1.UserRole.AGENCE_HOTE,
            user_role_enum_1.UserRole.ENTREPRISE_BTP, user_role_enum_1.UserRole.BOUTIQUE, user_role_enum_1.UserRole.QUINCAILLERIE,
        ];
        if (!allowed.includes(role)) {
            throw new common_1.ConflictException('Rôle invalide');
        }
        const updates = { role };
        if (role !== user_role_enum_1.UserRole.CLIENT) {
            updates.verificationStatus = verification_status_enum_1.VerificationStatus.ACTIVE;
        }
        await this.usersRepo.update(id, updates);
        return this.findById(id);
    }
    async verifyUser(id) {
        await this.usersRepo.update(id, { verificationStatus: verification_status_enum_1.VerificationStatus.ACTIVE });
    }
    async upgradeToPro(id, data) {
        const user = await this.findById(id);
        if (user.role !== user_role_enum_1.UserRole.CLIENT) {
            throw new common_1.ConflictException('Seul un compte client peut activer un espace pro');
        }
        const allowed = [user_role_enum_1.UserRole.ARTISAN, user_role_enum_1.UserRole.AGENCE_HOTE, user_role_enum_1.UserRole.ENTREPRISE_BTP, user_role_enum_1.UserRole.BOUTIQUE, user_role_enum_1.UserRole.QUINCAILLERIE];
        if (!allowed.includes(data.role)) {
            throw new common_1.ConflictException('Type de profil pro invalide');
        }
        // Les artisans doivent être validés par leur agence → statut en attente.
        // Les autres profils pro sont actifs immédiatement.
        const isArtisan = data.role === user_role_enum_1.UserRole.ARTISAN;
        const updates = {
            role: data.role,
            verificationStatus: isArtisan
                ? verification_status_enum_1.VerificationStatus.AFFILIATION_REQUESTED
                : verification_status_enum_1.VerificationStatus.ACTIVE,
        };
        if (data.specialty)
            updates.specialty = data.specialty;
        if (data.city)
            updates.city = data.city;
        if (data.agencyName)
            updates.agencyName = data.agencyName;
        if (data.shopName)
            updates.shopName = data.shopName;
        if (data.address)
            updates.address = data.address;
        if (data.description)
            updates.description = data.description;
        if (data.btpMode)
            updates.btpMode = data.btpMode;
        if (data.radiusKm)
            updates.radiusKm = data.radiusKm;
        if (data.contractAccepted)
            updates.proContractAcceptedAt = new Date();
        if (data.agencyId)
            updates.agencyId = data.agencyId;
        await this.usersRepo.update(id, updates);
        // Création du profil artisan (visible par l'agence pour validation)
        if (isArtisan) {
            const existing = await this.artisansRepo.findOne({ where: { user: { id } }, relations: ['user'] });
            const specialty = artisan_entity_1.ArtisanSpecialty[data.specialty]
                ?? artisan_entity_1.ArtisanSpecialty.MENUISERIE;
            if (existing) {
                await this.artisansRepo.update(existing.id, {
                    specialty, city: data.city ?? existing.city ?? 'Abidjan',
                    bio: data.description ?? existing.bio, isVerified: false, isAvailable: false,
                });
            }
            else {
                const artisan = this.artisansRepo.create({
                    user: { id },
                    specialty,
                    city: data.city ?? 'Abidjan',
                    bio: data.description,
                    isVerified: false,
                    isAvailable: false,
                });
                await this.artisansRepo.save(artisan);
            }
        }
        // Enregistrement des pièces justificatives (CNI, selfie, docs administratifs)
        if (data.documents?.length) {
            const docs = data.documents
                .filter(d => d?.url)
                .map(({ type, url }) => this.docsRepo.create({
                userId: id,
                type: document_entity_1.DocumentType[type] ?? document_entity_1.DocumentType.OTHER,
                fileUrl: url,
            }));
            if (docs.length)
                await this.docsRepo.save(docs);
        }
        return this.findById(id);
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.UserEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(document_entity_1.DocumentEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(artisan_entity_1.ArtisanEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map