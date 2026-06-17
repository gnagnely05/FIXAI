import { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { Link, router } from 'expo-router';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '@fixai/shared';

const ROLE_OPTIONS: { label: string; value: UserRole }[] = [
  { label: 'Client', value: UserRole.CLIENT },
  { label: 'Artisan', value: UserRole.ARTISAN },
  { label: 'Agence Hôte', value: UserRole.AGENCE_HOTE },
  { label: 'Entreprise BTP', value: UserRole.ENTREPRISE_BTP },
  { label: 'Boutique', value: UserRole.BOUTIQUE },
  { label: 'Quincaillerie', value: UserRole.QUINCAILLERIE },
];

export default function RegisterScreen() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    role: UserRole.CLIENT,
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const updateField = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleRegister = async () => {
    const { firstName, lastName, email, phone, password } = form;
    if (!firstName || !lastName || !email || !phone || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      await register(form);
      router.replace('/(tabs)');
    } catch {
      Alert.alert('Erreur', 'Une erreur est survenue lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Créer un compte</Text>

      <Input placeholder="Prénom" value={form.firstName} onChangeText={(v) => updateField('firstName', v)} />
      <Input placeholder="Nom" value={form.lastName} onChangeText={(v) => updateField('lastName', v)} />
      <Input
        placeholder="Email"
        value={form.email}
        onChangeText={(v) => updateField('email', v)}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Input
        placeholder="Téléphone (ex: 0701234567)"
        value={form.phone}
        onChangeText={(v) => updateField('phone', v)}
        keyboardType="phone-pad"
      />
      <Input
        placeholder="Mot de passe (min. 8 caractères)"
        value={form.password}
        onChangeText={(v) => updateField('password', v)}
        secureTextEntry
      />

      <Text style={styles.label}>Type de compte</Text>
      <View style={styles.roleGrid}>
        {ROLE_OPTIONS.map((option) => (
          <Button
            key={option.value}
            title={option.label}
            onPress={() => updateField('role', option.value)}
            variant={form.role === option.value ? 'primary' : 'outline'}
            style={styles.roleButton}
          />
        ))}
      </View>

      <Button title="S'inscrire" onPress={handleRegister} loading={loading} />

      <View style={styles.footer}>
        <Text style={styles.footerText}>Déjà un compte ? </Text>
        <Link href="/(auth)/login" style={styles.link}>
          Se connecter
        </Link>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 24,
    gap: 12,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
  },
  roleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  roleButton: {
    flex: 1,
    minWidth: '45%',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  footerText: {
    color: '#666',
  },
  link: {
    color: '#FF6B00',
    fontWeight: '600',
  },
});
