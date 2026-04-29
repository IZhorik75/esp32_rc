import { StatusBar } from 'expo-status-bar';
import { TouchableOpacity, Animated, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { StyleSheet, Text, View, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [password, setPassword] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [doorStatus, setDoorStatus] = useState('closed');
  const [theme, setTheme] = useState('light');
  const [isLoading, setIsLoading] = useState(true);
  const [doorStatusFromServer, setDoorStatusFromServer] = useState('closed');
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [serverIp, setServerIp] = useState('192.168.1.100'); // Замените на IP вашего сервера
  
  const themeAnim = useRef(new Animated.Value(theme === 'light' ? 0 : 1)).current;
  
  // Загрузка сохраненной темы при запуске
  useEffect(() => {
    loadSavedTheme();
    fetchDoorStatus();
    
    // Обновляем статус каждые 5 секунд
    const interval = setInterval(fetchDoorStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  // Функция получения статуса с сервера
  const fetchDoorStatus = async () => {
    try {
      const response = await fetch(`http://${serverIp}:8000/api/door/status`);
      const data = await response.json();
      setDoorStatusFromServer(data.status);
      setDoorStatus(data.status); // Синхронизируем с локальным состоянием
    } catch (error) {
      console.error('Ошибка получения статуса:', error);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  // Функция загрузки сохраненной темы
  const loadSavedTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('appTheme');
      if (savedTheme !== null) {
        setTheme(savedTheme);
      }
    } catch (error) {
      console.error('Ошибка загрузки темы:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Функция сохранения темы
  const saveTheme = async (newTheme) => {
    try {
      await AsyncStorage.setItem('appTheme', newTheme);
    } catch (error) {
      console.error('Ошибка сохранения темы:', error);
    }
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    saveTheme(newTheme);
  };
  
  useEffect(() => {
    Animated.spring(themeAnim, {
      toValue: theme === 'light' ? 0 : 1,
      useNativeDriver: true,
      tension: 120,
      friction: 14,
    }).start();
  }, [theme]);

  const correctPassword = 'esp32';

  const themes = {
    light: {
      background: '#f5f5f5',
      text: '#333',
      secondary: '#666',
      input: '#fff',
      border: '#007AFF',
    },
    dark: {
      background: '#1a1a1a',
      text: '#fff',
      secondary: '#aaa',
      input: '#2a2a2a',
      border: '#007AFF',
    },
  };

  const currentTheme = themes[theme];

  const handleRegister = () => {
    if (password === correctPassword) {
      setIsRegistered(true);
      Alert.alert('Success', 'App registered successfully!');
    } else {
      Alert.alert('Error', 'Incorrect password');
      setPassword('');
    }
  };

  const thumbTranslate = themeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 28],
  });

  const sunOpacity = themeAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0, 0],
  });

  const moonOpacity = themeAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  const backgroundColor = themeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(224, 224, 224, 0.7)', 'rgba(51, 51, 51, 0.7)'],
  });

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: '#f5f5f5' }]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 20 }}>Загрузка...</Text>
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
          <TouchableOpacity 
            style={styles.themeToggleWrapper}
            onPress={() => handleThemeChange(theme === 'light' ? 'dark' : 'light')}
            activeOpacity={0.8}
          >
            <Animated.View style={[styles.themeToggleTrack, { backgroundColor }]}>
              <View style={styles.glassOverlay} />
              <Animated.View style={[styles.themeToggleThumb, { transform: [{ translateX: thumbTranslate }] }]}>
                <Animated.Text style={[styles.themeToggleIcon, { opacity: sunOpacity }]}>☀️</Animated.Text>
                <Animated.Text style={[styles.themeToggleIcon, { opacity: moonOpacity, position: 'absolute' }]}>🌙</Animated.Text>
              </Animated.View>
            </Animated.View>
          </TouchableOpacity>

          {!isRegistered ? (
            <>
              <Text style={[styles.title, { color: currentTheme.text }]}>Smart Door Control</Text>
              <Text style={[styles.subtitle, { color: currentTheme.secondary }]}>Enter Password to Register</Text>
              <TextInput
                style={[styles.input, { backgroundColor: currentTheme.input, borderColor: currentTheme.border, color: currentTheme.text }]}
                placeholder="Enter password"
                placeholderTextColor={currentTheme.secondary}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity style={[styles.registerButton, { backgroundColor: currentTheme.border }]} onPress={handleRegister}>
                <Text style={styles.buttonText}>Register</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={[styles.title, { color: currentTheme.text }]}>Smart Door Control</Text>
              <Text style={[styles.subtitle, { color: currentTheme.secondary }]}>Welcome! You are registered</Text>
              
              {/* Видео плесхолдер */}
              <View style={styles.videoContainer}>
                <View style={[styles.videoPlaceholder, { backgroundColor: currentTheme.input }]}>
                  {/* Серая иконка камеры */}
                  <View style={styles.cameraIcon}>
                    <Text style={styles.cameraIconText}>📷</Text>
                  </View>
                  <Text style={[styles.videoPlaceholderText, { color: currentTheme.secondary }]}>
                    Video Not Found
                  </Text>
                  <Text style={[styles.videoPlaceholderSubtext, { color: currentTheme.secondary }]}>
                    Подключение к камере ESP32-CAM...
                  </Text>
                  <View style={styles.statusIndicator}>
                    <View style={[styles.statusDot, { backgroundColor: isLoadingStatus ? '#FFA500' : '#34C759' }]} />
                    <Text style={[styles.statusText, { color: currentTheme.secondary }]}>
                      {isLoadingStatus ? 'Подключение...' : 'Сервер онлайн'}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={[styles.statusContainer, { backgroundColor: currentTheme.input }]}>
                <Text style={[styles.statusLabel, { color: currentTheme.secondary }]}>Door Status:</Text>
                <Text style={[styles.statusValue, doorStatusFromServer === 'open' ? styles.statusOpen : styles.statusClosed]}>
                  {doorStatusFromServer === 'open' ? '🔓 OPEN' : '🔒 CLOSED'}
                </Text>
              </View>

              <TouchableOpacity 
                style={[styles.doorButton, doorStatusFromServer === 'open' ? styles.doorButtonOpen : styles.doorButtonClosed]} 
                onPress={() => {
                  const newStatus = doorStatusFromServer === 'closed' ? 'open' : 'closed';
                  setDoorStatusFromServer(newStatus);
                  Alert.alert('Door', `Door is now ${newStatus}`);
                }}
              >
                <Text style={styles.doorButtonText}>
                  {doorStatusFromServer === 'closed' ? '🔓 OPEN DOOR' : '🔒 CLOSE DOOR'}
                </Text>
              </TouchableOpacity>

              {/* Информация о сервере */}
              <View style={styles.serverInfo}>
                <Text style={[styles.serverInfoText, { color: currentTheme.secondary }]}>
                  Сервер: {serverIp}:8000
                </Text>
                <TouchableOpacity onPress={() => {
                  Alert.prompt('Изменить IP сервера', 'Введите IP адрес сервера:', [
                    { text: 'Отмена', style: 'cancel' },
                    { 
                      text: 'OK', 
                      onPress: (ip) => {
                        if (ip) {
                          setServerIp(ip);
                          fetchDoorStatus();
                          Alert.alert('Успех', 'IP сервера обновлен');
                        }
                      }
                    }
                  ]);
                }}>
                  <Text style={[styles.changeIpText, { color: currentTheme.border }]}>
                    Изменить IP
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.logoutButton} onPress={() => setIsRegistered(false)}>
                <Text style={styles.logoutButtonText}>Logout</Text>
              </TouchableOpacity>
            </>
          )}
          <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  themeToggleWrapper: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 1000,
  },
  themeToggleTrack: {
    width: 60,
    height: 32,
    borderRadius: 16,
    padding: 2,
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  themeToggleThumb: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  themeToggleIcon: {
    fontSize: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 2,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 20,
  },
  registerButton: {
    width: '100%',
    height: 50,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Стили для видео плесхолдера
  videoContainer: {
    width: '100%',
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  videoPlaceholder: {
    width: '100%',
    aspectRatio: 16 / 9, // Соотношение 16:9 как у стандартной камеры
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  cameraIcon: {
    marginBottom: 15,
  },
  cameraIconText: {
    fontSize: 48,
    opacity: 0.5,
  },
  videoPlaceholderText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  videoPlaceholderSubtext: {
    fontSize: 12,
    marginBottom: 15,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  // Стили для статуса двери
  statusContainer: {
    alignItems: 'center',
    marginBottom: 20,
    padding: 15,
    borderRadius: 10,
    width: '100%',
  },
  statusLabel: {
    fontSize: 14,
    marginBottom: 5,
  },
  statusValue: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  statusOpen: {
    color: '#FF3B30',
  },
  statusClosed: {
    color: '#34C759',
  },
  // Стили для кнопки двери
  doorButton: {
    width: '100%',
    height: 60,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  doorButtonOpen: {
    backgroundColor: '#FF3B30',
  },
  doorButtonClosed: {
    backgroundColor: '#34C759',
  },
  doorButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  // Информация о сервере
  serverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  serverInfoText: {
    fontSize: 12,
  },
  changeIpText: {
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  logoutButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#ccc',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
});