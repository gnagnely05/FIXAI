import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Artisan } from '@fixai/shared';

const SPECIALTY_LABELS: Record<string, string> = {
  PLOMBERIE: 'Plombier',
  ELECTRICITE: 'Électricien',
  MACONNERIE: 'Maçon',
  MENUISERIE: 'Menuisier',
  PEINTURE: 'Peintre',
  DECORATION: 'Décorateur',
  CARRELAGE: 'Carreleur',
  CLIMATISATION: 'Climaticien',
  TOITURE: 'Couvreur',
  FERRONNERIE: 'Ferronnier',
};

interface ArtisanCardProps {
  artisan: Artisan;
  onPress: () => void;
  style?: ViewStyle;
}

export function ArtisanCard({ artisan, onPress, style }: ArtisanCardProps) {
  const initials = `${artisan.user.firstName[0]}${artisan.user.lastName[0]}`.toUpperCase();
  const specialtyLabel = SPECIALTY_LABELS[artisan.specialty] ?? artisan.specialty;
  const formattedRate = artisan.hourlyRate > 0
    ? `${artisan.hourlyRate.toLocaleString('fr-CI')} FCFA/h`
    : 'Tarif sur demande';

  return (
    <TouchableOpacity style={[styles.card, style]} onPress={onPress} activeOpacity={0.85}>
      {/* Avatar */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        {artisan.isVerified && (
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={14} color="#10B981" />
            <Text style={styles.verifiedText}>Certifié</Text>
          </View>
        )}
      </View>

      {/* Name & Specialty */}
      <Text style={styles.name} numberOfLines={1}>
        {artisan.user.firstName} {artisan.user.lastName}
      </Text>
      <Text style={styles.specialty}>{specialtyLabel}</Text>

      {/* Location */}
      <View style={styles.locationRow}>
        <Ionicons name="location-outline" size={14} color="#9CA3AF" />
        <Text style={styles.location} numberOfLines={1}>
          {artisan.location.district ? `${artisan.location.district}, ` : ''}{artisan.location.city}
        </Text>
      </View>

      {/* Rating & Experience */}
      <View style={styles.statsRow}>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={14} color="#F59E0B" />
          <Text style={styles.rating}>{artisan.rating.toFixed(1)}</Text>
          <Text style={styles.reviewCount}>({artisan.reviewCount})</Text>
        </View>
        {artisan.yearsOfExperience > 0 && (
          <Text style={styles.experience}>
            {artisan.yearsOfExperience} an{artisan.yearsOfExperience > 1 ? 's' : ''} d'exp.
          </Text>
        )}
      </View>

      {/* Availability & Rate */}
      <View style={styles.footer}>
        <View style={[styles.availabilityDot, { backgroundColor: artisan.isAvailable ? '#10B981' : '#EF4444' }]} />
        <Text style={[styles.availabilityText, { color: artisan.isAvailable ? '#10B981' : '#EF4444' }]}>
          {artisan.isAvailable ? 'Disponible' : 'Indisponible'}
        </Text>
        <Text style={styles.rate}>{formattedRate}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF6B00',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  specialty: {
    fontSize: 14,
    color: '#FF6B00',
    fontWeight: '600',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 10,
  },
  location: {
    fontSize: 13,
    color: '#9CA3AF',
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  reviewCount: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  experience: {
    fontSize: 13,
    color: '#666',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  availabilityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  availabilityText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  rate: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1a1a1a',
  },
});
