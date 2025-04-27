import { useEffect, useState } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';

export default function Verify() {
  const [params] = useSearchParams();
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const token = params.get('token');
    if (token) {
      axios.get(`/api/auth/verify?token=${token}`)
        .then(res => setMsg(res.data.message))
        .catch(err => setMsg("Invalid or expired token"));
    }
  }, [params]);

  return <div><h2>Email Verification</h2><p>{msg}</p></div>;
}
