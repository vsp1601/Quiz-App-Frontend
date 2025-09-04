import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../theme/colors';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }: any) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

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
    <>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: Math.max(insets.top, 20) }
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formContainer}>
            <Text style={styles.title}>Welcome back</Text>
            
            <View style={styles.inputGroup}>
              <TextInput 
                placeholder="Email" 
                placeholderTextColor="rgba(255,255,255,0.5)"
                autoCapitalize='none' 
                style={styles.input} 
                value={email} 
                onChangeText={setEmail}
                keyboardType="email-address"
                autoComplete="email"
              />
              
              <TextInput 
                placeholder="Password" 
                placeholderTextColor="rgba(255,255,255,0.5)"
                secureTextEntry 
                style={styles.input} 
                value={password} 
                onChangeText={setPassword}
                autoComplete="password"
              />
            </View>

            <TouchableOpacity 
              onPress={onLogin} 
              style={[styles.btn, loading && styles.btnDisabled]} 
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={styles.btnText}>
                {loading ? 'Signing in…' : 'Sign In'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => navigation.replace('Register')}
              style={styles.linkContainer}
              activeOpacity={0.7}
            >
              <Text style={styles.link}>New here? Create an account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.bg,
  },
  
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  
  title: { 
    color: colors.text, 
    fontSize: 28, 
    fontWeight: '800', 
    marginBottom: 32,
    textAlign: 'center',
  },
  
  inputGroup: {
    marginBottom: 24,
    gap: 16,
  },
  
  input: { 
    backgroundColor: colors.card, 
    color: colors.text, 
    padding: 16, 
    borderRadius: 12, 
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  
  btn: { 
    backgroundColor: colors.accent, 
    padding: 16, 
    borderRadius: 12, 
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: colors.accent,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  
  btnDisabled: {
    opacity: 0.6,
  },
  
  btnText: { 
    color: '#00331F', 
    fontWeight: '800',
    fontSize: 16,
  },
  
  linkContainer: {
    paddingVertical: 8,
  },
  
  link: { 
    color: colors.textDim, 
    textAlign: 'center',
    fontSize: 14,
  }
});