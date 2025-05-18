import React, { createContext, useState, useContext } from "react";

// Tạo Context
const UserContext = createContext();

// Custom hook để sử dụng UserContext
export const useUser = () => useContext(UserContext);

// Provider để cung cấp dữ liệu user
export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
};
