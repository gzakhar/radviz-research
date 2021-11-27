import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

export default function Login() {

    const [password, setPassword] = useState('');
    const history = useHistory();

    function handleSubmit(e) {
        if (password == 'sbupwd')
            localStorage.setItem('pwd', password)
        history.push('/survey')
        e.preventDefault();
    }

    return (
        <div style={{  textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <form onSubmit={(e) => handleSubmit(e)}>
                <h1>SBU sign in</h1>
                <input type='password' placeholder='password' value={password} onChange={(e) => setPassword(e.target.value)} />
                <button>Sign in</button>
            </form>
        </div>
    )
}