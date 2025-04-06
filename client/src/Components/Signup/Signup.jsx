import { useState } from 'react';
import { Link } from 'react-router-dom';

function Signup({ setUser, toggle }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    console.log(name);
    console.log(email);
    console.log(password);
    
    const res = await fetch('http://localhost:7000/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    console.log(data)
    if (data.token) {
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
    } else {
      alert("Signup fail ra bey!");
    }
  };

  return (
    <div className='sign-up'>
      <h2>Signup Chey Ra Machi!</h2>
      <form onSubmit={handleSignup}>
        <input
          type="text"
          placeholder="Name ra"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email ra"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password ra"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Signup</button>
      </form>
      <p>Account unda? <Link to='/login'><button>Login</button></Link></p>
    </div>
  );
}

export default Signup;