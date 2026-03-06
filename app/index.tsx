import { Feather, Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
// Importamos o Stack e o useRouter do Expo Router
import { Stack, useRouter } from "expo-router";

// --- DEFINIÇÕES DE TIPOS (TypeScript) ---
// Removido "mapa" daqui pois agora é um ficheiro separado
type ScreenType = "home" | "listas" | "avisos" | "chat";
type StatusPresenca = "presente" | "ausente";
type UserRole = "motorista" | "aluno";

interface Aluno {
  id: string;
  nome: string;
  status: StatusPresenca;
  destino: string;
}

// --- DADOS FALSOS (Para simular a base de dados da Chamada) ---
const ALUNOS_MOCK: Aluno[] = [
  { id: "1", nome: "Ana Silva", status: "presente", destino: "Escola Central" },
  { id: "2", nome: "Bruno Costa", status: "ausente", destino: "Escola Norte" },
  { id: "3", nome: "Carlos Mendes", status: "presente", destino: "Escola Central" },
  { id: "4", nome: "Diana Rocha", status: "presente", destino: "Universidade" },
  { id: "5", nome: "Eduardo Lima", status: "ausente", destino: "Universidade" },
  { id: "6", nome: "Fátima Gomes", status: "presente", destino: "Escola Sul" },
];

export default function Home() {
  const router = useRouter();

  // Estados
  const [currentScreen, setCurrentScreen] = useState<ScreenType>("home");
  // Estado para o nosso simulador de perfis (Motorista ou Aluno)
  const [userRole, setUserRole] = useState<UserRole>("motorista");

  // Cores base inspiradas no teu Figma
  const theme = {
    primary: "#00C6FF",
    secondary: "#0072FF",
    background: "#F4F7F6",
    white: "#FFFFFF",
    textDark: "#333333",
    textLight: "#888888",
    green: "#28A745",
    red: "#DC3545",
    tealCard: "#38b29c",
    darkGreen: "#005b44",
  };

  // Componente: Simulador de Perfil (Barra no Topo)
  const RoleSimulatorBar = () => (
    <View style={styles.simulatorBar}>
      <Text style={styles.simulatorText}>A simular como:</Text>
      <TouchableOpacity
        onPress={() => setUserRole(userRole === "motorista" ? "aluno" : "motorista")}
        style={styles.simulatorBtn}
      >
        <Text style={[styles.simulatorBtnText, { color: theme.tealCard }]}>
          {userRole === "motorista" ? "Motorista" : "Aluno / Pai"} (Mudar)
        </Text>
      </TouchableOpacity>
    </View>
  );

  // -----------------------------------------
  // ECRÃ 1: HOME (Tela Principal do Figma)
  // -----------------------------------------
  const renderHome = () => (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <StatusBar barStyle="light-content" backgroundColor={theme.tealCard} />
        
        {/* Barra de Simulação (Apenas para Testes) */}
        <RoleSimulatorBar />

        {/* Cabeçalho */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Olá, {userRole === "motorista" ? "Motorista!" : "Ana (Aluna)!"}
            </Text>
            <Text style={styles.date}>Rota Manhã - 26 Fev</Text>
          </View>
          
          {/* LIGAÇÃO PARA O NOVO FICHEIRO DE PERFIL */}
          <TouchableOpacity onPress={() => router.push("/perfil")}>
            <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
              <Text style={{ color: "#FFF", fontWeight: "bold" }}>
                {userRole === "motorista" ? "M" : "A"}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={[styles.alertCard, { borderLeftColor: theme.red }]}>
            <Ionicons name="warning" size={24} color={theme.red} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={{ fontWeight: "bold", color: theme.red }}>
                {userRole === "motorista" ? "Aviso de Trânsito" : "Atraso na Rota"}
              </Text>
              <Text style={{ fontSize: 12, color: theme.textDark }}>
                Desvio na Rota Central devido a obras.
              </Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>
            {userRole === "motorista" ? "Menu Principal" : "Menu do Aluno"}
          </Text>

          <View style={styles.grid}>
            {userRole === "motorista" ? (
              // --- VISÃO DO MOTORISTA ---
              <>
                <TouchableOpacity style={styles.gridItem} onPress={() => setCurrentScreen("listas")}>
                  <View style={[styles.iconBox, { backgroundColor: theme.primary + "20" }]}>
                    <Feather name="users" size={28} color={theme.secondary} />
                  </View>
                  <Text style={styles.gridText}>Lista Alunos</Text>
                </TouchableOpacity>

                {/* ATUALIZADO: Vai para a nova pasta do Mapa */}
                <TouchableOpacity style={styles.gridItem} onPress={() => router.push("/mapa")}>
                  <View style={[styles.iconBox, { backgroundColor: theme.green + "20" }]}>
                    <Feather name="map-pin" size={28} color={theme.green} />
                  </View>
                  <Text style={styles.gridText}>Pontos/Mapa</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.gridItem} onPress={() => setCurrentScreen("avisos")}>
                  <View style={[styles.iconBox, { backgroundColor: theme.red + "20" }]}>
                    <Feather name="bell" size={28} color={theme.red} />
                  </View>
                  <Text style={styles.gridText}>Enviar Avisos</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.gridItem} onPress={() => setCurrentScreen("chat")}>
                  <View style={[styles.iconBox, { backgroundColor: "#FFC10720" }]}>
                    <Feather name="message-square" size={28} color="#FFC107" />
                  </View>
                  <Text style={styles.gridText}>Chat com Pais</Text>
                </TouchableOpacity>
              </>
            ) : (
              // --- VISÃO DO ALUNO / RESPONSÁVEL ---
              <>
                {/* ATUALIZADO: Vai para a nova pasta do Mapa */}
                <TouchableOpacity style={styles.gridItem} onPress={() => router.push("/mapa")}>
                  <View style={[styles.iconBox, { backgroundColor: theme.green + "20" }]}>
                    <Feather name="navigation" size={28} color={theme.green} />
                  </View>
                  <Text style={styles.gridText}>Localizar Autocarro</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.gridItem} onPress={() => Alert.alert("Status", "Avisar o motorista que não vais hoje?")}>
                  <View style={[styles.iconBox, { backgroundColor: theme.primary + "20" }]}>
                    <Feather name="user-check" size={28} color={theme.secondary} />
                  </View>
                  <Text style={styles.gridText}>O Meu Status</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.gridItem} onPress={() => setCurrentScreen("avisos")}>
                  <View style={[styles.iconBox, { backgroundColor: theme.red + "20" }]}>
                    <Feather name="bell" size={28} color={theme.red} />
                  </View>
                  <Text style={styles.gridText}>Mural de Avisos</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.gridItem} onPress={() => setCurrentScreen("chat")}>
                  <View style={[styles.iconBox, { backgroundColor: "#FFC10720" }]}>
                    <Feather name="message-square" size={28} color="#FFC107" />
                  </View>
                  <Text style={styles.gridText}>Falar com Motorista</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
        <BottomNav />
      </SafeAreaView>
    </>
  );

  // -----------------------------------------
  // ECRÃ 2: LISTAS DE ALUNOS (Ecrãs Verde/Vermelho do Figma)
  // -----------------------------------------
  const renderListas = () => (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <View style={styles.headerSimples}>
          <TouchableOpacity onPress={() => setCurrentScreen("home")}>
            <Feather name="arrow-left" size={24} color={theme.textDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chamada de Alunos</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content}>
          {ALUNOS_MOCK.map((aluno) => (
            <View key={aluno.id} style={[styles.alunoCard, { borderLeftColor: aluno.status === "presente" ? theme.green : theme.red }]}>
              <View>
                <Text style={styles.alunoNome}>{aluno.nome}</Text>
                <Text style={styles.alunoDestino}>{aluno.destino}</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: aluno.status === "presente" ? theme.green : theme.red }]}>
                <Text style={styles.badgeText}>{aluno.status.toUpperCase()}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
        <BottomNav />
      </SafeAreaView>
    </>
  );

  // -----------------------------------------
  // COMPONENTE: Navegação Inferior
  // -----------------------------------------
  const BottomNav = () => (
    <View style={styles.bottomNav}>
      <TouchableOpacity onPress={() => setCurrentScreen("home")} style={styles.navItem}>
        <Feather name="home" size={24} color={currentScreen === "home" ? theme.secondary : theme.textLight} />
        <Text style={[styles.navText, { color: currentScreen === "home" ? theme.secondary : theme.textLight }]}>Início</Text>
      </TouchableOpacity>

      {/* Condicional: Motorista vê Listas, Aluno vê Chat ou Avisos na barra inferior */}
      {userRole === "motorista" ? (
        <TouchableOpacity onPress={() => setCurrentScreen("listas")} style={styles.navItem}>
          <Feather name="list" size={24} color={currentScreen === "listas" ? theme.secondary : theme.textLight} />
          <Text style={[styles.navText, { color: currentScreen === "listas" ? theme.secondary : theme.textLight }]}>Listas</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={() => setCurrentScreen("chat")} style={styles.navItem}>
          <Feather name="message-square" size={24} color={currentScreen === "chat" ? theme.secondary : theme.textLight} />
          <Text style={[styles.navText, { color: currentScreen === "chat" ? theme.secondary : theme.textLight }]}>Chat</Text>
        </TouchableOpacity>
      )}

      {/* ATUALIZADO: Usar router.push em vez de setCurrentScreen */}
      <TouchableOpacity onPress={() => router.push("/mapa")} style={styles.navItem}>
        <Feather name="map" size={24} color={theme.textLight} />
        <Text style={[styles.navText, { color: theme.textLight }]}>Mapa</Text>
      </TouchableOpacity>
      
      {/* Sair leva para a página isolada do login.tsx */}
      <TouchableOpacity onPress={() => router.replace("/login")} style={styles.navItem}>
        <Feather name="log-out" size={24} color={theme.textLight} />
        <Text style={styles.navText}>Sair</Text>
      </TouchableOpacity>
    </View>
  );

  // Renderizador Principal (Router Local)
  if (currentScreen === "home") return renderHome();
  if (currentScreen === "listas") return renderListas();

  // Fallback para ecrãs (como chat, avisos) ainda não implementados
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background, justifyContent: "center", alignItems: "center" }]}>
        <Feather name="tool" size={50} color={theme.textLight} style={{ marginBottom: 20 }} />
        <Text style={{ fontSize: 18, color: theme.textDark }}>Ecrã em construção</Text>
        <TouchableOpacity onPress={() => setCurrentScreen("home")} style={{ marginTop: 20, padding: 15, backgroundColor: theme.primary, borderRadius: 10 }}>
          <Text style={{ color: "#FFF", fontWeight: "bold" }}>Voltar ao Início</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </>
  );
}

// -----------------------------------------
// ESTILOS (CSS do React Native)
// -----------------------------------------
const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { padding: 20 },

  // Estilos da Barra do Simulador
  simulatorBar: { backgroundColor: "#38b29c", flexDirection: "row", justifyContent: "center", alignItems: "center", paddingVertical: 10, paddingHorizontal: 20 },
  simulatorText: { color: "#FFF", fontWeight: "bold", marginRight: 10, fontSize: 12 },
  simulatorBtn: { backgroundColor: "#FFF", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15 },
  simulatorBtnText: { fontSize: 12, fontWeight: "bold" },

  // Estilos Home
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, backgroundColor: "#FFF", borderBottomWidth: 1, borderBottomColor: "#EEE" },
  greeting: { fontSize: 20, fontWeight: "bold", color: "#333" },
  date: { fontSize: 14, color: "#888" },
  avatar: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center" },
  alertCard: { flexDirection: "row", backgroundColor: "#FFF", padding: 15, borderRadius: 12, marginBottom: 20, borderLeftWidth: 4, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#333", marginBottom: 15 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  gridItem: { width: "47%", backgroundColor: "#FFF", padding: 20, borderRadius: 15, alignItems: "center", marginBottom: 15, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  iconBox: { width: 60, height: 60, borderRadius: 30, justifyContent: "center", alignItems: "center", marginBottom: 10 },
  gridText: { fontSize: 14, fontWeight: "600", color: "#333", textAlign: "center" },

  // Estilos Listas
  headerSimples: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, backgroundColor: "#FFF", borderBottomWidth: 1, borderBottomColor: "#EEE" },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#333" },
  alunoCard: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#FFF", padding: 16, borderRadius: 12, marginBottom: 12, borderLeftWidth: 5, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, elevation: 1 },
  alunoNome: { fontSize: 16, fontWeight: "bold", color: "#333" },
  alunoDestino: { fontSize: 12, color: "#888", marginTop: 4 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: "#FFF", fontSize: 10, fontWeight: "bold" },

  // Estilos Bottom Nav
  bottomNav: { flexDirection: "row", justifyContent: "space-around", padding: 15, backgroundColor: "#FFF", borderTopWidth: 1, borderTopColor: "#EEE" },
  navItem: { alignItems: "center" },
  navText: { fontSize: 10, marginTop: 4, fontWeight: "600" },
});