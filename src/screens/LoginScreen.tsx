import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import colors from '../theme/colors';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }: any) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    try {
      setLoading(true);
      await login(email.trim(), password);
    } catch (e: any) {
      Alert.alert('Login failed', e?.message || 'Please check credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome back</Text>
      <TextInput placeholder="Email" autoCapitalize='none' style={styles.input} value={email} onChangeText={setEmail} />
      <TextInput placeholder="Password" secureTextEntry style={styles.input} value={password} onChangeText={setPassword} />
      <TouchableOpacity onPress={onLogin} style={styles.btn} disabled={loading}>
        <Text style={styles.btnText}>{loading ? 'Signing in…' : 'Sign In'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.replace('Register')}>
        <Text style={styles.link}>New here? Create an account</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 20, justifyContent: 'center' },
  title: { color: colors.text, fontSize: 28, fontWeight: '800', marginBottom: 24 },
  input: { backgroundColor: colors.card, color: colors.text, padding: 14, borderRadius: 12, marginBottom: 12 },
  btn: { backgroundColor: colors.accent, padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 4 },
  btnText: { color: '#00331F', fontWeight: '800' },
  link: { color: colors.textDim, marginTop: 16, textAlign: 'center' }
});
