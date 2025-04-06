import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie'

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show , setShow] = useState(false);
  const navigate = useNavigate();
  
  useEffect(()=>{
    const jwtToken = Cookies.get('jwt_token');
    if (jwtToken !== undefined){
      navigate('/home');
    }
  },[]);

  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost:7000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.token) {
      const jwtToken = data.token
      console.log(data);
      Cookies.set('jwt_token', jwtToken, { expires: 7 });
      Cookies.set('user_id', data.user_id );
      navigate('/home');
    } else {
      alert("Login fail!");
    }
  };

  const onChange = () =>{
    setShow(!show)
  }

  return (
    <div className='login-form'>
      <h2>Please Login!</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type={!show ? "password" : 'text'}
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input type="checkbox" onClick={onChange} />
        <button type="submit">Login</button>
      </form>
      <p>No account? <Link to='/signup'>
      <button>Signup</button>
      </Link>
      </p>
    </div>
  );
}

export default Login;