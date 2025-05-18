import { useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
export default function Logout() {
    const navigate = useNavigate();

    useEffect(() => {
        axios.post('http://localhost:4000/api/logout', { withCredentials: true })   
            .then((response) => {
                console.log(response.data.message);
                localStorage.removeItem('jwt');
                navigate('/login');
            })
            .catch((error) => {
                if (error.response && error.response.status === 401) {
                    console.log('Không có quyền đăng xuất. Token không hợp lệ hoặc đã hết hạn.');
                } else {
                    console.log(error);
                }
            });
    }, []); // useEffect chạy khi component được load

    return (
        <div>
            <h1 className='text-center'>Bạn đã đăng xuất</h1>
        </div>
    );
}
