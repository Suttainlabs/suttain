
import React from 'react';

const AuthContext = React.createContext({
    user: null,
    isAuthLoading: true,
    openAuthModal: () => {},
    refreshUser: async () => {}
});

export default AuthContext;
