import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from "react-native";
import colors from "../theme/colors";
import { useAuth } from "../context/AuthContext";

export default function RegisterScreen({ navigation }: any) {
  const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onRegister = async () => {
    try {
      setLoading(true);
      await register(email.trim(), password);
      // No navigation here — Gate will switch to Home because token is set
    } catch (e: any) {
      Alert.alert("Register failed", e?.message || "Please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create account</Text>
      <TextInput
        placeholder="Email"
        placeholderTextColor={colors.textDim}
        autoCapitalize="none"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        placeholder="Password"
        placeholderTextColor={colors.textDim}
        secureTextEntry
        style={styles.input}
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity onPress={onRegister} style={styles.btn} disabled={loading}>
        <Text style={styles.btnText}>{loading ? "Creating…" : "Register"}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.replace("Login")}>
        <Text style={styles.link}>Have an account? Sign in</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 20, justifyContent: "center" },
  title: { color: colors.text, fontSize: 28, fontWeight: "800", marginBottom: 24 },
  input: {
    backgroundColor: colors.card,
    color: colors.text,
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  btn: { backgroundColor: colors.accent, padding: 14, borderRadius: 12, alignItems: "center", marginTop: 4 },
  btnText: { color: "#00331F", fontWeight: "800" },
  link: { color: colors.textDim, marginTop: 16, textAlign: "center" },
});
