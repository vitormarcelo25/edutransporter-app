// Função fake de login por enquanto. Depois a gente liga na API de verdade!
export const fakeLogin = async (email: string, pass: string) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ success: true, token: '123' });
        }, 1000);
    });
};
