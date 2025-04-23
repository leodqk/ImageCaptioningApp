import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Image,
    ActivityIndicator,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

// Giả lập logo khi chưa có asset thật
const dummyLogo = { uri: 'https://via.placeholder.com/100x100/2E86C1/FFFFFF?text=Logo' };

const LoginScreen = () => {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [identifierType, setIdentifierType] = useState<'email' | 'username'>('email');
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();
    const { login } = useAuth();

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleLogin = async () => {
        if (!identifier.trim() || !password.trim()) {
            Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
            return;
        }

        // Kiểm tra định dạng email nếu người dùng chọn đăng nhập bằng email
        if (identifierType === 'email' && !validateEmail(identifier)) {
            Alert.alert('Lỗi', 'Email không hợp lệ');
            return;
        }

        setIsLoading(true);
        try {
            const credentials = identifierType === 'email'
                ? { email: identifier, password }
                : { username: identifier, password };

            await login(credentials);
            router.replace('/(tabs)');
        } catch (error: any) {
            Alert.alert('Lỗi', error.response?.data?.error || 'Đăng nhập thất bại. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleIdentifierType = () => {
        setIdentifierType(prev => prev === 'email' ? 'username' : 'email');
        setIdentifier('');
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollView}>
                <View style={styles.logoContainer}>
                    <Image
                        source={dummyLogo}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <Text style={styles.title}>Image Captioning App</Text>
                </View>

                <View style={styles.formContainer}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>
                            {identifierType === 'email' ? 'Email' : 'Username'}
                        </Text>
                        <TextInput
                            style={styles.input}
                            value={identifier}
                            onChangeText={setIdentifier}
                            placeholder={identifierType === 'email' ? 'Enter your email' : 'Enter your username'}
                            keyboardType={identifierType === 'email' ? 'email-address' : 'default'}
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Password</Text>
                        <TextInput
                            style={styles.input}
                            value={password}
                            onChangeText={setPassword}
                            placeholder="Enter your password"
                            secureTextEntry
                        />
                    </View>

                    <TouchableOpacity style={styles.toggleContainer} onPress={toggleIdentifierType}>
                        <Text style={styles.toggleText}>
                            Sign in with {identifierType === 'email' ? 'username' : 'email'} instead
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.forgotPassword} onPress={() => Alert.alert('Coming Soon', 'Forgot password feature will be available soon.')}>
                        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleLogin}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Sign In</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.registerContainer}>
                        <Text style={styles.registerText}>Don't have an account? </Text>
                        <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                            <Text style={styles.registerLink}>Sign Up</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollView: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logo: {
        width: 100,
        height: 100,
        marginBottom: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2E86C1',
    },
    formContainer: {
        width: '100%',
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
        fontWeight: '500',
        color: '#333',
    },
    input: {
        backgroundColor: '#f9f9f9',
        padding: 15,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#ddd',
        fontSize: 16,
    },
    button: {
        backgroundColor: '#2E86C1',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 20,
    },
    forgotPasswordText: {
        color: '#2E86C1',
        fontSize: 14,
    },
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    registerText: {
        color: '#333',
        fontSize: 14,
    },
    registerLink: {
        color: '#2E86C1',
        fontSize: 14,
        fontWeight: 'bold',
    },
    toggleContainer: {
        marginBottom: 15,
    },
    toggleText: {
        color: '#2E86C1',
        fontSize: 14,
    },
});

export default LoginScreen; 