// =====================================================
// FALA COMIGO - App de ensino: Telefonia e SMS com Expo
// =====================================================
// Conceitos trabalhados:
// 1. Estado com useState
// 2. Validação simples de entrada
// 3. Linking: abrir outros apps do celular (discador)
// 4. expo-sms: verificar disponibilidade e abrir o app de mensagens
// 5. async/await e tratamento de erros
// =====================================================

import { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  Linking,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as SMS from 'expo-sms';

export default function App() {
  // ---------- ESTADOS ----------
  const [numero, setNumero] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [historico, setHistorico] = useState([]);

  // ---------- FUNÇÕES AUXILIARES ----------

  // Remove tudo que não for número (espaços, parênteses, traços)
  function limparNumero(texto) {
    //Expressão Regular - regex
    /// ... /: as barras marcam o começo e o fim da expressão regular em JavaScript;
    //\D: significa “qualquer caractere que NÃO seja dígito”. O \d minúsculo é “um dígito de 0 a 9”, e a versão maiúscula é o contrário.
    //g: é a flag global. Sem ela, o replace trocaria só a primeira ocorrência e pararia. Com ela, troca todas.
    //'': é o que vai entrar no lugar de cada caractere encontrado. Como é uma string vazia, o caractere simplesmente some.
    return texto.replace(/\D/g, '');
  }

  // Um número válido precisa ter pelo menos 8 dígitos
  function numeroValido() {
    const limpo = limparNumero(numero);
    if (limpo.length < 8) {
      Alert.alert('Número inválido', 'Digite um número com pelo menos 8 dígitos.');
      return false;
    }
    return true;
  }

  // Adiciona uma linha no histórico (as mais recentes em cima)
  function registrar(acao) {
    const hora = new Date().toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
    setHistorico([`${hora} - ${acao} para ${numero}`, ...historico]);
  }

  // ---------- TELEFONIA ----------
  // O esquema "tel:" pede ao sistema para abrir o discador.
  // O app NÃO faz a ligação sozinho: o usuário confirma no discador.
  async function ligar() {
    if (!numeroValido()) return;

    const url = `tel:${limparNumero(numero)}`;

    try {
      const podeAbrir = await Linking.canOpenURL(url);
      if (podeAbrir) {
        await Linking.openURL(url);
        registrar('Ligação');
      } else {
        Alert.alert('Ops', 'Este aparelho não consegue fazer ligações.');
      }
    } catch (erro) {
      Alert.alert('Erro', 'Não foi possível abrir o discador.');
    }
  }

  // ---------- SMS ----------
  // O expo-sms abre o app de mensagens com número e texto preenchidos.
  // Por segurança, o envio final é sempre feito pelo usuário.
  async function enviarSMS() {
    if (!numeroValido()) return;

    if (mensagem.trim() === '') {
      Alert.alert('Mensagem vazia', 'Escreva alguma coisa antes de enviar.');
      return;
    }

    const disponivel = await SMS.isAvailableAsync();
    if (!disponivel) {
      Alert.alert('Ops', 'SMS não está disponível neste aparelho.');
      return;
    }

    try {
      const { result } = await SMS.sendSMSAsync(
        [limparNumero(numero)], // pode ser uma lista com vários números
        mensagem
      );
      // result pode ser: 'sent', 'cancelled' ou 'unknown'
      // (no Android normalmente volta 'unknown')
      registrar(`SMS (${result})`);
      setMensagem('');
    } catch (erro) {
      Alert.alert('Erro', 'Não foi possível abrir o app de mensagens.');
    }
  }

  // ---------- INTERFACE ----------
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.titulo}>Fala Comigo</Text>
      <Text style={styles.subtitulo}>Ligue ou mande um SMS</Text>

      <Text style={styles.rotulo}>Número</Text>
      <TextInput
        style={styles.input}
        placeholder="(11) 99999-9999"
        keyboardType="phone-pad"
        value={numero}
        onChangeText={setNumero}
      />

      <Text style={styles.rotulo}>Mensagem (para SMS)</Text>
      <TextInput
        style={[styles.input, styles.inputMensagem]}
        placeholder="Escreva sua mensagem..."
        multiline
        maxLength={160}
        value={mensagem}
        onChangeText={setMensagem}
      />
      <Text style={styles.contador}>{mensagem.length}/160</Text>

      <View style={styles.linhaBotoes}>
        <TouchableOpacity style={[styles.botao, styles.botaoLigar]} onPress={ligar}>
          <Text style={styles.textoBotao}>Ligar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.botao, styles.botaoSMS]} onPress={enviarSMS}>
          <Text style={styles.textoBotao}>Enviar SMS</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.rotulo}>Histórico</Text>
      {historico.length === 0 ? (
        <Text style={styles.vazio}>Nenhuma ação ainda.</Text>
      ) : (
        historico.slice(0, 5).map((item, indice) => (
          <Text key={indice} style={styles.itemHistorico}>
            {item}
          </Text>
        ))
      )}
    </KeyboardAvoidingView>
  );
}

// ---------- ESTILOS ----------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6fb',
    paddingHorizontal: 24,
    paddingTop: 70,
  },
  titulo: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#1e2a4a',
    textAlign: 'center',
  },
  subtitulo: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 30,
  },
  rotulo: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e2a4a',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
  inputMensagem: {
    height: 90,
    textAlignVertical: 'top',
  },
  contador: {
    alignSelf: 'flex-end',
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 4,
  },
  linhaBotoes: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    marginBottom: 20,
  },
  botao: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  botaoLigar: {
    backgroundColor: '#16a34a',
  },
  botaoSMS: {
    backgroundColor: '#2563eb',
  },
  textoBotao: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  vazio: {
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  itemHistorico: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
    color: '#374151',
  },
});