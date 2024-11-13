import React, { useState, useEffect } from 'react';

const UsersList = () => {
    const [users, setUsers] = useState([]);

    // API 호출
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/users/all'); // Spring Boot 서버에서 데이터 가져오기
            const data = await response.json();
            setUsers(data); // 상태 업데이트
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };


    return (
        <div>
            <h1>User List</h1>
            {users.length > 0 ? (
                <ul>
                    {users.map(user => (
                        <li key={user.userNo}>{user.userName}</li> // 사용자의 이름을 출력 (예시)
                    ))}
                </ul>
            ) : (
                <p>No users found.</p>
            )}
        </div>
    );
};

export default UsersList;
