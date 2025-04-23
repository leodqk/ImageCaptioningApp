import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    SafeAreaView,
    Alert,
    ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { adminService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

interface User {
    id: string;
    username: string;
    email: string;
    full_name?: string;
    is_active: boolean;
    role: string;
}

interface Stats {
    users: number;
    images: number;
    pending_reports: number;
}

const AdminScreen = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<Stats | null>(null);
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (user?.role !== 'admin') {
            Alert.alert('Access Denied', 'You do not have admin privileges.');
            router.replace('/(tabs)');
        } else {
            fetchDashboardData();
        }
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const statsData = await adminService.getStats();
            setStats(statsData);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
            Alert.alert('Error', 'Failed to load dashboard data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const userData = await adminService.getAllUsers();
            setUsers(userData.users || []);
        } catch (error) {
            console.error('Failed to fetch users:', error);
            Alert.alert('Error', 'Failed to load users. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        if (tab === 'dashboard') {
            fetchDashboardData();
        } else if (tab === 'users') {
            fetchUsers();
        }
    };

    const toggleUserStatus = async (userId: string, isActive: boolean) => {
        try {
            await adminService.changeUserStatus(userId, !isActive);
            // Update the local users list
            setUsers(
                users.map((user) =>
                    user.id === userId ? { ...user, is_active: !isActive } : user
                )
            );
            Alert.alert('Success', `User ${!isActive ? 'activated' : 'deactivated'} successfully.`);
        } catch (error) {
            console.error('Failed to toggle user status:', error);
            Alert.alert('Error', 'Failed to update user status. Please try again.');
        }
    };

    const changeUserRole = async (userId: string, newRole: string) => {
        try {
            await adminService.changeUserRole(userId, newRole);
            // Update the local users list
            setUsers(
                users.map((user) =>
                    user.id === userId ? { ...user, role: newRole } : user
                )
            );
            Alert.alert('Success', `User role changed to ${newRole} successfully.`);
        } catch (error) {
            console.error('Failed to change user role:', error);
            Alert.alert('Error', 'Failed to update user role. Please try again.');
        }
    };

    const renderUserItem = ({ item }: { item: User }) => (
        <View style={styles.userCard}>
            <View style={styles.userInfo}>
                <Text style={styles.username}>{item.username}</Text>
                <Text style={styles.email}>{item.email}</Text>
                <Text style={styles.details}>
                    Name: {item.full_name || 'Not provided'} • Role: {item.role}
                </Text>
                <View
                    style={[
                        styles.statusBadge,
                        { backgroundColor: item.is_active ? '#2ECC71' : '#E74C3C' },
                    ]}
                >
                    <Text style={styles.statusText}>
                        {item.is_active ? 'Active' : 'Inactive'}
                    </Text>
                </View>
            </View>
            <View style={styles.userActions}>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: item.is_active ? '#E74C3C' : '#2ECC71' }]}
                    onPress={() => toggleUserStatus(item.id, item.is_active)}
                >
                    <Text style={styles.actionButtonText}>
                        {item.is_active ? 'Deactivate' : 'Activate'}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#3498DB' }]}
                    onPress={() =>
                        changeUserRole(item.id, item.role === 'admin' ? 'user' : 'admin')
                    }
                >
                    <Text style={styles.actionButtonText}>
                        Make {item.role === 'admin' ? 'User' : 'Admin'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderDashboard = () => (
        <ScrollView style={styles.dashboardContainer}>
            {loading ? (
                <ActivityIndicator size="large" color="#2E86C1" style={styles.loader} />
            ) : (
                <>
                    <Text style={styles.sectionTitle}>System Statistics</Text>
                    <View style={styles.statsContainer}>
                        <View style={styles.statCard}>
                            <Ionicons name="people" size={40} color="#2E86C1" />
                            <Text style={styles.statValue}>{stats?.users || 0}</Text>
                            <Text style={styles.statLabel}>Users</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Ionicons name="images" size={40} color="#2E86C1" />
                            <Text style={styles.statValue}>{stats?.images || 0}</Text>
                            <Text style={styles.statLabel}>Images</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Ionicons name="alert-circle" size={40} color="#E74C3C" />
                            <Text style={styles.statValue}>{stats?.pending_reports || 0}</Text>
                            <Text style={styles.statLabel}>Pending Reports</Text>
                        </View>
                    </View>

                    <View style={styles.adminActions}>
                        <TouchableOpacity
                            style={styles.adminActionButton}
                            onPress={() => handleTabChange('users')}
                        >
                            <Ionicons name="people" size={24} color="#fff" />
                            <Text style={styles.adminActionText}>Manage Users</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.adminActionButton}
                            onPress={() => {
                                Alert.alert('Coming Soon', 'This feature is under development.');
                            }}
                        >
                            <Ionicons name="images" size={24} color="#fff" />
                            <Text style={styles.adminActionText}>Manage Images</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.adminActionButton}
                            onPress={() => {
                                Alert.alert('Coming Soon', 'This feature is under development.');
                            }}
                        >
                            <Ionicons name="alert-circle" size={24} color="#fff" />
                            <Text style={styles.adminActionText}>Handle Reports</Text>
                        </TouchableOpacity>
                    </View>
                </>
            )}
        </ScrollView>
    );

    const renderUsersList = () => (
        <View style={styles.listContainer}>
            {loading ? (
                <ActivityIndicator size="large" color="#2E86C1" style={styles.loader} />
            ) : (
                <FlatList
                    data={users}
                    renderItem={renderUserItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.usersList}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>No users found</Text>
                    }
                />
            )}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Admin Dashboard</Text>
            </View>

            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[
                        styles.tabButton,
                        activeTab === 'dashboard' && styles.activeTab,
                    ]}
                    onPress={() => handleTabChange('dashboard')}
                >
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === 'dashboard' && styles.activeTabText,
                        ]}
                    >
                        Dashboard
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tabButton, activeTab === 'users' && styles.activeTab]}
                    onPress={() => handleTabChange('users')}
                >
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === 'users' && styles.activeTabText,
                        ]}
                    >
                        Users
                    </Text>
                </TouchableOpacity>
            </View>

            {activeTab === 'dashboard' ? renderDashboard() : renderUsersList()}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        backgroundColor: '#2E86C1',
        paddingVertical: 15,
        paddingHorizontal: 20,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    tabContainer: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    tabButton: {
        flex: 1,
        paddingVertical: 15,
        alignItems: 'center',
    },
    tabText: {
        fontSize: 16,
        color: '#666',
    },
    activeTab: {
        borderBottomWidth: 3,
        borderBottomColor: '#2E86C1',
    },
    activeTabText: {
        color: '#2E86C1',
        fontWeight: 'bold',
    },
    dashboardContainer: {
        flex: 1,
        padding: 15,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#f9f9f9',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginHorizontal: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 10,
    },
    statLabel: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333',
    },
    adminActions: {
        marginTop: 20,
    },
    adminActionButton: {
        backgroundColor: '#2E86C1',
        padding: 15,
        borderRadius: 8,
        marginBottom: 15,
        flexDirection: 'row',
        alignItems: 'center',
    },
    adminActionText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    listContainer: {
        flex: 1,
        padding: 15,
    },
    usersList: {
        paddingBottom: 20,
    },
    userCard: {
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    userInfo: {
        marginBottom: 15,
    },
    username: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    email: {
        fontSize: 16,
        color: '#666',
        marginBottom: 5,
    },
    details: {
        fontSize: 14,
        color: '#888',
        marginBottom: 10,
    },
    statusBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 15,
    },
    statusText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    userActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    actionButton: {
        flex: 1,
        paddingVertical: 8,
        borderRadius: 5,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    loader: {
        marginTop: 50,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
        color: '#666',
    },
});

export default AdminScreen; 