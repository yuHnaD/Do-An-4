// import { createBrowserRouter} from 'react-router-dom';
// import App from '../App.js';
// import Login from '../components/user/Login.js';
// import Home from '../components/home/Home.js';
// import Product from '../components/product/Product.js';
// import DetailProduct from '../components/product/DetailProduct.js';
// import DetailUser from '../components/user/DetailUser.js';
// import Register from '../components/user/Register.js';
// import Logout  from '../components/user/Logout.js';
// import Cart from '../components/cart/Cart.js';
// import Checkout from '../components/cart/Checkout.js';
// import Order from '../components/cart/Order.js';
// import OrderDetail from '../components/cart/OrderDetail.js';
// import SearchResult from '../components/product/SearchResult.js';
// import PaymentSuccess from '../components/cart/PaymentSuccess.js';
// import PaymentFailure from '../components/cart/PaymentFailure.js';
// export const router = createBrowserRouter([
//     {
//         path: "/",
//         element: <App />,
//         children: [
//             {
//                 path:"/home", 
//                 element: <Home />
//             },
//             {
//                 path:"/product",
//                 element: <Product />
//             },
//             {
//                 path:"/login",
//                 element: <Login />
//             },
//             {
//                 path: "/register",
//                 element: <Register />
//             },
//             {   path: "/logout", 
//                 element: <Logout /> 
//             },
//             {
//                 path: "/detail-product/:id",
//                 element: <DetailProduct />
//             },
//             {
//                 path: "/detail-user/:userid",
//                 element: <DetailUser />
//             },
//             {
//                 path: "/cart",
//                 element: <Cart />
//             },
//             {
//                 path: "/checkout",
//                 element: <Checkout />
//             },
//             {
//                 path: "/orders",
//                 element: <Order />
//             },
//             {
//                 path: "/order-details/:madh",
//                 element: <OrderDetail />
//             },
//             {
//                 path:"/search",
//                 element: <SearchResult/>
//             },
//             {
//                 path:"/payment-success",
//                 element: <PaymentSuccess/>
//             },
//             {
//                 path:"/payment-failure",
//                 element: <PaymentFailure/>
//             }
//         ]
//     },
//     {
//         path: "*",
//         element: <div>Không tìm thấy web theo yêu cầu</div>
//     }
// ]);
import { createBrowserRouter } from 'react-router-dom';
import App from '../App.js';
import Login from '../components/user/Login.js';
import Home from '../components/home/Home.js';
import Product from '../components/product/Product.js';
import DetailProduct from '../components/product/DetailProduct.js';
import DetailUser from '../components/user/DetailUser.js';
import Register from '../components/user/Register.js';
import Logout from '../components/user/Logout.js';
import Cart from '../components/cart/Cart.js';
import Checkout from '../components/cart/Checkout.js';
import Order from '../components/cart/Order.js';
import OrderDetail from '../components/cart/OrderDetail.js';
import SearchResult from '../components/product/SearchResult.js';
import PaymentSuccess from '../components/cart/PaymentSuccess.js';
import PaymentFailure from '../components/cart/PaymentFailure.js';

export const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            {
                index: true,
                element: <Home />
            },
            {
                path: "/home",
                element: <Home />
            },
            {
                path: "/product",
                element: <Product />
            },
            {
                path: "/login",
                element: <Login />
            },
            {
                path: "/register",
                element: <Register />
            },
            {
                path: "/logout",
                element: <Logout />
            },
            {
                path: "/detail-product/:id",
                element: <DetailProduct />
            },
            {
                path: "/detail-user/:userid",
                element: <DetailUser />
            },
            {
                path: "/cart",
                element: <Cart />
            },
            {
                path: "/checkout",
                element: <Checkout />
            },
            {
                path: "/orders",
                element: <Order />
            },
            {
                path: "/order-details/:madh",
                element: <OrderDetail />
            },
            {
                path: "/search",
                element: <SearchResult />
            },
            {
                path: "/payment-success",
                element: <PaymentSuccess />
            },
            {
                path: "/payment-failure",
                element: <PaymentFailure />
            },
        ]
    },
    {
        path: "*",
        element: <div>Không tìm thấy web theo yêu cầu</div>
    }
]);