import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

export default function Login() {

    const [password, setPassword] = useState('');
    const history = useHistory();

    function handleSubmit(e) {
        if (password == 'sbupwd')
            localStorage.setItem('pwd', password)
        history.goBack();
        e.preventDefault();
    }

    return (
        <div style={{ textAlign: 'center' }}>
            <form onSubmit={(e) => handleSubmit(e)}>
                <h1>Please sign in</h1>
                <input type='password' placeholder='password' value={password} onChange={(e) => setPassword(e.target.value)} />
                <button>Sign in</button>
            </form>
        </div>
    )
}