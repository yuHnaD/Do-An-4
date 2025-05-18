// Import các thư viện và hook cần thiết
import React, { useState, useEffect } from "react"; // React core và hook useState, useEffect để quản lý trạng thái và vòng đời component
import { useCart } from "../CartContext"; // Hook tùy chỉnh để truy cập giỏ hàng, tổng giá, và xóa giỏ hàng
import { useNavigate } from "react-router-dom"; // Hook để điều hướng người dùng (ví dụ: chuyển đến trang đăng nhập)
import { formatPrice } from "../../utils/utils"; // Hàm tiện ích để định dạng giá tiền
import axios from "axios"; // Thư viện để gửi yêu cầu HTTP (gọi API)
import L from "leaflet"; // Thư viện Leaflet để hiển thị bản đồ
import "leaflet/dist/leaflet.css"; // CSS cho bản đồ Leaflet
import Autosuggest from "react-autosuggest"; // Thư viện để hiển thị gợi ý địa chỉ tự động

// Component Checkout: Xử lý giao diện và logic thanh toán
const Checkout = () => {
    // Lấy các hàm từ CartContext để quản lý giỏ hàng
    const { cart, getTotalPrice, clearCart } = useCart();
    // Khởi tạo hook điều hướng
    const navigate = useNavigate();

    // State lưu thông tin đơn hàng (ID người dùng, địa chỉ, ngày đặt, trạng thái)
    const [orderInfo, setOrderInfo] = useState({
        userid: null,
        diachinhanhang: "",
        ngaydat: new Date().toISOString(),
        trangthai: 1,
    });

    // State lưu phí vận chuyển
    const [shippingFee, setShippingFee] = useState(0);
    // State lưu instance bản đồ Leaflet
    const [map, setMap] = useState(null);
    // State lưu marker vị trí người dùng trên bản đồ
    const [userMarker, setUserMarker] = useState(null);
    // State lưu danh sách marker của các cửa hàng
    const [storeMarkers, setStoreMarkers] = useState([]);
    // State lưu danh sách gợi ý địa chỉ từ OpenCage API
    const [suggestions, setSuggestions] = useState([]);
    // State lưu phương thức thanh toán (mặc định là COD)
    const [paymentMethod, setPaymentMethod] = useState("cod");
    // State lưu danh sách cửa hàng từ server
    const [stores, setStores] = useState([]);
    // State lưu cửa hàng được chọn để giao hàng
    const [selectedStore, setSelectedStore] = useState(null);
    // State lưu tuyến đường từ người dùng đến cửa hàng
    const [route, setRoute] = useState(null);
    // State lưu thời gian giao hàng dự kiến
    const [estimatedDeliveryTime, setEstimatedDeliveryTime] = useState("");
    // State kiểm tra xem bản đồ đã được khởi tạo chưa
    const [isMapInitialized, setIsMapInitialized] = useState(false);
    // State kiểm tra xem người dùng và cửa hàng có cùng thành phố không
    const [isSameCity, setIsSameCity] = useState(null);

    // Khóa API của OpenCage để tra cứu tọa độ địa chỉ
    const API_KEY = "4ff1c811d03744d0813b0d2d61eedcac";

    // useEffect: Kiểm tra đăng nhập, lấy danh sách cửa hàng, và dọn dẹp bản đồ
    useEffect(() => {
        // Kiểm tra đăng nhập bằng userid từ localStorage
        const userid = localStorage.getItem("userid");
        if (userid) {
            // Cập nhật orderInfo với userid nếu đã đăng nhập
            setOrderInfo((prev) => ({ ...prev, userid }));
        } else {
            // Chuyển hướng đến trang đăng nhập nếu chưa đăng nhập
            alert("Bạn cần đăng nhập trước khi thanh toán.");
            navigate("/login");
        }

        // Hàm lấy danh sách cửa hàng từ server
        const fetchStores = async () => {
            try {
                // Gửi yêu cầu GET để lấy danh sách cửa hàng
                const response = await axios.get("http://localhost:4000/api/stores");
                // Lấy thông tin thành phố cho từng cửa hàng bằng OpenCage API
                const storesWithCity = await Promise.all(
                    response.data.map(async (store) => {
                        const storeResponse = await axios.get(
                            `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(store.diachi)}&key=${API_KEY}&countrycode=VN`
                        );
                        const city = storeResponse.data.results[0]?.components?.city || "";
                        return { ...store, city };
                    })
                );
                // Lưu danh sách cửa hàng vào state
                setStores(storesWithCity);
            } catch (error) {
                // Ghi log lỗi nếu không lấy được danh sách cửa hàng
                console.error("Lỗi khi lấy danh sách cửa hàng:", error);
            }
        };

        // Gọi hàm lấy danh sách cửa hàng
        fetchStores();

        // Dọn dẹp: Xóa bản đồ khi component bị hủy
        return () => {
            if (map) {
                map.remove();
            }
        };
    }, [navigate]); // Chạy lại khi navigate thay đổi

    // useEffect: Khởi tạo bản đồ Leaflet với các marker cửa hàng
    useEffect(() => {
        // Chỉ khởi tạo nếu có danh sách cửa hàng và bản đồ chưa được khởi tạo
        if (stores.length > 0 && !isMapInitialized) {
            // Lấy cửa hàng đầu tiên để đặt tâm bản đồ
            const firstStore = stores[0];
            // Khởi tạo bản đồ với tâm là tọa độ cửa hàng đầu tiên, mức zoom 13
            const mapInstance = L.map("map", { scrollWheelZoom: false }).setView(
                [firstStore.lat, firstStore.lng],
                13
            );
            // Thêm lớp bản đồ từ OpenStreetMap
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                maxZoom: 19,
            }).addTo(mapInstance);

            // Tạo biểu tượng tùy chỉnh cho marker cửa hàng
            const storeIcon = L.icon({
                iconUrl: "http://localhost:4000/uploads/store.png",
                iconSize: [30, 30],
                iconAnchor: [15, 30],
                popupAnchor: [0, -30],
            });

            // Tạo marker cho từng cửa hàng
            const newStoreMarkers = stores.map((store) => {
                const storeMarker = L.marker([store.lat, store.lng], { icon: storeIcon })
                    .addTo(mapInstance)
                    .bindPopup(`
                        <div style="text-align: center;">
                            <h6>${store.tencuahang}</h6>
                            <p>${store.diachi}</p>
                            ${store.hinhanh ? `<img src="http://localhost:4000/uploads/${store.hinhanh}" alt="${store.tencuahang}" style="max-width: 150px; max-height: 150px; border-radius: 8px; margin-top: 8px;" />` : '<p>Không có hình ảnh</p>'}
                        </div>
                    `);
                return storeMarker;
            });

            // Lưu instance bản đồ và danh sách marker vào state
            setMap(mapInstance);
            setStoreMarkers(newStoreMarkers);
            // Đánh dấu bản đồ đã được khởi tạo
            setIsMapInitialized(true);
        }
    }, [stores]); // Chạy lại khi danh sách cửa hàng thay đổi

    // Hàm tính phí vận chuyển dựa trên địa chỉ người dùng
    const calculateShippingFee = async (address) => {
        // Nếu không có địa chỉ, xóa các marker, tuyến đường và đặt lại phí vận chuyển
        if (!address) {
            if (userMarker) {
                map.removeLayer(userMarker);
                setUserMarker(null);
            }
            if (route) {
                map.removeLayer(route);
                setRoute(null);
            }
            setSelectedStore(null);
            setShippingFee(0);
            setEstimatedDeliveryTime("");
            setIsSameCity(null);
            if (stores.length > 0) {
                const firstStore = stores[0];
                map.setView([firstStore.lat, firstStore.lng], 13);
            }
            return;
        }

        try {
            // Chia địa chỉ thành các phần để thử tìm tọa độ
            const parts = address.split(",").map((part) => part.trim());
            let found = false;

            // Thử tìm tọa độ cho từng phần của địa chỉ
            for (let i = 0; i < parts.length; i++) {
                const partialAddress = parts.slice(i).join(", ");
                const response = await axios.get(
                    `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(partialAddress)}&key=${API_KEY}&countrycode=VN`
                );

                const data = response.data;
                if (data.results && data.results.length > 0) {
                    // Lấy tọa độ và thành phố từ kết quả API
                    const { lat, lng } = data.results[0].geometry;
                    const userCity = data.results[0]?.components?.city || "";

                    // Tạo biểu tượng tùy chỉnh cho marker người dùng
                    const userIcon = L.icon({
                        iconUrl: "http://localhost:4000/uploads/mui_ten.png",
                        iconSize: [32, 32],
                        iconAnchor: [16, 32],
                        popupAnchor: [0, -32],
                    });

                    // Cập nhật hoặc tạo marker người dùng
                    if (userMarker) {
                        userMarker.setLatLng([lat, lng]).bindPopup(address).openPopup();
                    } else if (map) {
                        const newUserMarker = L.marker([lat, lng], { icon: userIcon })
                            .addTo(map)
                            .bindPopup(address)
                            .openPopup();
                        setUserMarker(newUserMarker);
                    }

                    // Tìm cửa hàng gần nhất
                    let nearestStore = null;
                    let minDistance = Infinity;

                    stores.forEach((store) => {
                        const distance = calculateDistance(lat, lng, store.lat, store.lng);
                        if (distance < minDistance) {
                            minDistance = distance;
                            nearestStore = store;
                        }
                    });

                    // Nếu tìm thấy cửa hàng gần nhất, tính tuyến đường và phí vận chuyển
                    if (nearestStore) {
                        setSelectedStore(nearestStore);
                        await calculateRouteAndDeliveryTime(lat, lng, nearestStore, address, userCity);
                    } else {
                        alert("Không tìm thấy cửa hàng nào phù hợp.");
                    }

                    found = true;
                    break;
                }
            }

            // Hiển thị thông báo nếu không tìm thấy tọa độ
            if (!found) {
                alert("Không tìm thấy tọa độ cho địa chỉ này. Vui lòng kiểm tra lại.");
            }
        } catch (error) {
            // Ghi log và thông báo lỗi nếu API thất bại
            console.error("Lỗi khi gọi OpenCage API:", error);
            alert("Đã xảy ra lỗi khi kiểm tra địa chỉ. Vui lòng thử lại.");
        }
    };

    // Hàm lấy gợi ý địa chỉ từ OpenCage API
    const getAddressSuggestions = async (value) => {
        try {
            // Xóa gợi ý nếu giá trị rỗng
            if (value.trim() === "") {
                setSuggestions([]);
                return;
            }
            // Gọi API để lấy gợi ý địa chỉ
            const response = await axios.get(
                `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(value)}&key=${API_KEY}&countrycode=VN`
            );
            const data = response.data;
            console.log("Gợi ý địa chỉ:", data.results);
            // Lưu danh sách gợi ý vào state
            if (data.results) {
                setSuggestions(data.results.map(result => result.formatted));
            } else {
                setSuggestions([]);
            }
        } catch (error) {
            // Ghi log và xóa gợi ý nếu API thất bại
            console.error("Lỗi khi lấy gợi ý địa chỉ:", error);
            setSuggestions([]);
        }
    };

    // Hàm xử lý khi chọn một gợi ý địa chỉ
    const handleSuggestionSelected = (event, { suggestion }) => {
        // Cập nhật địa chỉ nhận hàng với gợi ý được chọn
        setOrderInfo((prev) => ({ ...prev, diachinhanhang: suggestion }));
    };

    // Hàm tính khoảng cách giữa hai điểm theo công thức Haversine
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Bán kính Trái Đất (km)
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) *
                Math.cos((lat2 * Math.PI) / 180) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Trả về khoảng cách (km)
    };

    // Hàm tính tuyến đường và thời gian giao hàng
    const calculateRouteAndDeliveryTime = async (userLat, userLng, store, userAddress, userCity) => {
        try {
            // Tính khoảng cách từ người dùng đến cửa hàng
            const distance = calculateDistance(userLat, userLng, store.lat, store.lng);

            // Xác định thời gian giao hàng dựa trên khoảng cách
            let deliveryTime = "";
            if (distance <= 5) deliveryTime = "Giao trong ngày";
            else if (distance <= 20) deliveryTime = "Giao trong 1 ngày";
            else deliveryTime = "Giao trong 2 ngày";
            setEstimatedDeliveryTime(deliveryTime);

            // Kiểm tra xem người dùng và cửa hàng có cùng thành phố không
            const storeCity = store.city || "";
            const sameCity = userCity.toLowerCase() === storeCity.toLowerCase();
            setIsSameCity(sameCity);

            // Tính phí vận chuyển
            if (sameCity) {
                if (distance <= 5) {
                    setShippingFee(0); // Miễn phí nếu ≤ 5km
                } else {
                    setShippingFee(distance * 500); // 500 VNĐ/km nếu > 5km
                }
            } else {
                setShippingFee(30000); // Phí cố định 30,000 VNĐ nếu khác thành phố
            }

            // Xóa tuyến đường cũ nếu có
            if (route) {
                map.removeLayer(route);
            }

            // Gọi OSRM API để lấy tuyến đường từ cửa hàng đến địa điểm nhận hàng
            const response = await axios.get(
                `http://router.project-osrm.org/route/v1/driving/${store.lng},${store.lat};${userLng},${userLat}?overview=full&geometries=geojson`
            );

            // Chuyển đổi tọa độ tuyến đường
            let routeCoords = response.data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);

            // Đảm bảo điểm đầu tiên của tuyến đường dính sát cửa hàng
            if (routeCoords.length > 0) {
                routeCoords[0] = [store.lat, store.lng]; // Ghi đè tọa độ đầu tiên bằng tọa độ chính xác của cửa hàng
            }

            // Đảm bảo điểm cuối cùng dính sát địa điểm nhận hàng
            if (routeCoords.length > 1) {
                routeCoords[routeCoords.length - 1] = [userLat, userLng]; // Ghi đè tọa độ cuối cùng bằng tọa độ của người dùng
            }

            // Vẽ tuyến đường trên bản đồ
            const newRoute = L.polyline(routeCoords, { color: "blue" })
                .addTo(map)
                .bindPopup(`Đường từ ${store.tencuahang} đến địa điểm nhận hàng (${distance.toFixed(2)} km)`);
            setRoute(newRoute);

            // Căn chỉnh bản đồ để hiển thị toàn bộ tuyến đường
            map.fitBounds(newRoute.getBounds());
        } catch (error) {
            // Ghi log và thông báo lỗi nếu không vẽ được tuyến đường
            console.error("Lỗi khi vẽ tuyến đường:", error);
            alert("Không thể vẽ tuyến đường từ cửa hàng đến địa điểm nhận hàng!");
        }
    };

    // // Hàm lấy vị trí hiện tại của người dùng
    // const getCurrentLocation = async () => {
    //     // Kiểm tra trình duyệt có hỗ trợ định vị không
    //     if (navigator.geolocation) {
    //         navigator.geolocation.getCurrentPosition(
    //             async (position) => {
    //                 const { latitude, longitude } = position.coords;
    //                 try {
    //                     // Chuyển tọa độ thành địa chỉ bằng OpenCage API
    //                     const response = await axios.get(
    //                         `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${API_KEY}`
    //                     );
    //                     const address = response.data.results[0].formatted;
    //                     // Cập nhật địa chỉ nhận hàng
    //                     setOrderInfo((prev) => ({ ...prev, diachinhanhang: address }));
    //                     // Tính phí vận chuyển với địa chỉ vừa lấy
    //                     await calculateShippingFee(address);
    //                 } catch (error) {
    //                     // Ghi log và thông báo lỗi nếu không lấy được địa chỉ
    //                     console.error("Lỗi khi lấy địa chỉ từ vị trí:", error);
    //                     alert("Không thể lấy địa chỉ từ vị trí hiện tại.");
    //                 }
    //             },
    //             (error) => {
    //                 // Thông báo nếu người dùng từ chối cấp quyền định vị
    //                 alert("Vui lòng cho phép truy cập vị trí để sử dụng tính năng này.");
    //             }
    //         );
    //     } else {
    //         // Thông báo nếu trình duyệt không hỗ trợ định vị
    //         alert("Trình duyệt của bạn không hỗ trợ định vị.");
    //     }
    // };

    // Hàm xử lý đặt hàng
    const handlePlaceOrder = async () => {
        // Kiểm tra xem địa chỉ nhận hàng có được nhập không
        if (!orderInfo.diachinhanhang) {
            alert("Vui lòng nhập địa chỉ nhận hàng.");
            return;
        }

        try {
            // Tạo dữ liệu đơn hàng
            const orderData = {
                ...orderInfo,
                tonggia: Math.round(getTotalPrice() + shippingFee),
                chitietdonhang: cart.map((item) => ({
                    masach: item.masach,
                    gia: Math.round(item.gia),
                    soluong: item.quantity,
                })),
                phuongthucthanhtoan: paymentMethod === "cod" ? "COD" : "VNPay",
            };

            // Xử lý thanh toán COD
            if (paymentMethod === "cod") {
                // Gửi yêu cầu tạo đơn hàng
                const response = await axios.post("http://localhost:4000/api/orders", orderData);
                if (response.status === 200) {
                    // Thông báo thành công, xóa giỏ hàng và chuyển hướng
                    alert("Đặt hàng thành công!");
                    clearCart();
                    navigate("/cart");
                } else {
                    // Thông báo lỗi nếu tạo đơn hàng thất bại
                    alert(`Đặt hàng thất bại: ${response.data.message}`);
                }
            } 
            // Xử lý thanh toán VNPay
            else if (paymentMethod === "online") {
                // Gửi yêu cầu tạo đơn hàng
                const response = await axios.post("http://localhost:4000/api/orders", orderData);
                if (response.status === 200) {
                    // Lấy mã đơn hàng và tổng tiền
                    const madh = response.data.madh;
                    const amount = Math.round(orderData.tonggia);
                    // Tạo URL thanh toán VNPay
                    const paymentUrl = await createVNPayPayment(madh, amount);
                    // Chuyển hướng đến URL thanh toán
                    window.location.href = paymentUrl;
                } else {
                    // Thông báo lỗi nếu tạo đơn hàng thất bại
                    alert(`Đặt hàng thất bại: ${response.data.message}`);
                }
            }
        } catch (error) {
            // Ghi log và thông báo lỗi nếu đặt hàng thất bại
            console.error("Lỗi đặt hàng:", error);
            alert("Đã xảy ra lỗi, vui lòng thử lại sau.");
        }
    };

    // Hàm tạo URL thanh toán VNPay
    const createVNPayPayment = async (madh, amount) => {
        try {
            // Kiểm tra dữ liệu đầu vào
            if (!madh || isNaN(amount) || amount <= 0) {
                throw new Error("Dữ liệu không hợp lệ: madh hoặc amount không đúng.");
            }

            // Gửi yêu cầu tạo URL thanh toán
            const response = await axios.post("http://localhost:4000/api/create-payment", {
                madh: String(madh),
                amount: Number(amount),
                returnUrl: "http://localhost:4000/payment-return",
            });

            // Trả về URL thanh toán
            return response.data.paymentUrl;
        } catch (error) {
            // Ghi log và thông báo lỗi nếu tạo URL thất bại
            console.error("Lỗi khi tạo URL thanh toán VNPay:", error);
            alert("Không thể tạo URL thanh toán, vui lòng thử lại sau.");
            throw error;
        }
    };

    // Hàm xử lý khi ô nhập địa chỉ mất focus
    const handleInputBlur = async () => {
        // Tính phí vận chuyển nếu có địa chỉ, hoặc xóa nếu rỗng
        if (orderInfo.diachinhanhang.trim() !== "") {
            await calculateShippingFee(orderInfo.diachinhanhang.trim());
        } else {
            await calculateShippingFee("");
        }
    };

    // Cấu hình cho ô nhập địa chỉ Autosuggest
    const inputProps = {
        placeholder: "Nhập địa chỉ nhận hàng (ví dụ: 123 Nguyễn Văn Cừ, quận Ninh Kiều, Cần Thơ)",
        value: orderInfo.diachinhanhang,
        onChange: (e, { newValue }) => {
            // Cập nhật địa chỉ và xóa phí vận chuyển nếu rỗng
            setOrderInfo((prev) => ({ ...prev, diachinhanhang: newValue }));
            if (newValue.trim() === "") {
                calculateShippingFee("");
            }
        },
        onBlur: handleInputBlur,
        onKeyPress: (e) => {
            // Tính phí vận chuyển khi nhấn Enter
            if (e.key === "Enter") {
                handleInputBlur();
            }
        },
        className: "custom-address-input",
    };

    // Hàm hiển thị gợi ý địa chỉ
    const renderSuggestion = (suggestion) => (
        <div className="custom-suggestion-item">
            {suggestion}
        </div>
    );

    // Giao diện component
    return (
        <div className="container my-5">
            {/* Tiêu đề trang */}
            <h2 className="text-center mb-4">Thông Tin Đặt Hàng</h2>

            <div className="row flex-column">
                {/* Phần nhập địa chỉ */}
                <div className="card p-4 shadow-sm mb-4">
                    <label htmlFor="diachinhanhang" className="form-label">Địa chỉ nhận hàng:</label>
                    {/* Ô nhập địa chỉ với gợi ý tự động */}
                    <Autosuggest
                        suggestions={suggestions}
                        onSuggestionsFetchRequested={({ value }) => getAddressSuggestions(value)}
                        onSuggestionsClearRequested={() => setSuggestions([])}
                        onSuggestionSelected={handleSuggestionSelected}
                        getSuggestionValue={(suggestion) => suggestion}
                        renderSuggestion={renderSuggestion}
                        inputProps={inputProps}
                        theme={{
                            container: 'autosuggest-container',
                            suggestionsContainer: 'custom-suggestions-container',
                            suggestionsContainerOpen: 'custom-suggestions-container--open',
                            suggestionsList: 'custom-suggestions-list',
                            suggestion: 'custom-suggestion-item',
                            suggestionHighlighted: 'custom-suggestion-highlighted',
                        }}
                    />
                    {/* Nút lấy vị trí hiện tại */}
                    {/* <button className="btn btn-primary mt-2" onClick={getCurrentLocation}>
                        Lấy vị trí hiện tại
                    </button>  */}
                    {/* Hiển thị thông tin cửa hàng được chọn */}
                    {selectedStore && (
                        <div className="mt-3">
                            <h6>Cửa hàng giao hàng:</h6>
                            <p>{selectedStore.tencuahang} - {selectedStore.diachi}</p>
                            {userMarker && (
                                <>
                                    <p>
                                        Khoảng cách: {calculateDistance(
                                            userMarker.getLatLng().lat,
                                            userMarker.getLatLng().lng,
                                            selectedStore.lat,
                                            selectedStore.lng
                                        ).toFixed(2)} km
                                    </p>
                                    <p>Thời gian giao hàng dự kiến: {estimatedDeliveryTime}</p>
                                    <p>
                                        {isSameCity !== null && (
                                            <span>
                                                Địa chỉ nhận hàng {isSameCity ? "cùng nội thành" : "khác nội thành"} với cửa hàng.
                                            </span>
                                        )}
                                    </p>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Phần hiển thị bản đồ */}
                <div className="card p-4 shadow-sm mb-4">
                    <div id="map" style={{ height: "300px", width: "100%" }}></div>
                </div>

                {/* Phần hiển thị danh sách sản phẩm */}
                <div className="card p-4 shadow-sm mb-4">
                    <h5 className="mb-3">Thông Tin Sản Phẩm</h5>
                    <table className="table table-bordered">
                        <thead>
                            <tr>
                                <th className="text-center">STT</th>
                                <th className="text-center">Hình ảnh</th>
                                <th className="text-center">Tên sản phẩm</th>
                                <th className="text-center">Số lượng</th>
                                <th className="text-center">Giá tiền</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cart.map((item, index) => (
                                <tr key={item.masach}>
                                    <td className="text-center">{index + 1}</td>
                                    <td className="text-center">
                                        <img
                                            src={`http://localhost:4000/uploads/${item.hinhanh}`}
                                            alt={item.tenSP}
                                            className="img-fluid"
                                            style={{ maxWidth: '50px' }}
                                        />
                                    </td>
                                    <td className="text-center">{item.tenSP}</td>
                                    <td className="text-center">{item.quantity}</td>
                                    <td className="text-center">{formatPrice(item.gia * item.quantity)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Phần chọn phương thức thanh toán và hiển thị tổng tiền */}
                <div className="card p-4 shadow-sm mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5>Phương thức thanh toán:</h5>
                        <div>
                            <label className="me-3">
                                <input
                                    type="radio"
                                    value="cod"
                                    checked={paymentMethod === "cod"}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                />
                                Thanh toán khi nhận hàng
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    value="online"
                                    checked={paymentMethod === "online"}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                />
                                Thanh toán online (VNPay)
                            </label>
                        </div>
                    </div>
                    <h5>Phí vận chuyển: <span className="text-primary">{formatPrice(shippingFee)}</span></h5>
                    <h5>Tổng tiền: <span className="text-danger">{formatPrice(getTotalPrice() + shippingFee)}</span></h5>
                </div>

                {/* Nút xác nhận đặt hàng */}
                <button className="btn btn-success w-100" onClick={handlePlaceOrder}>
                    Xác Nhận Đặt Hàng
                </button>
            </div>

            {/* CSS tùy chỉnh cho ô nhập địa chỉ và gợi ý */}
            <style>{`
                .autosuggest-container {
                    position: relative;
                    width: 100%;
                }

                .custom-address-input {
                    width: 100%;
                    height: 50px;
                    padding: 12px 16px;
                    font-size: 16px;
                    border: 1px solid #ced4da;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    transition: all 0.3s ease;
                    outline: none;
                }

                .custom-address-input:focus {
                    border-color: #007bff;
                    box-shadow: 0 0 8px rgba(0, 123, 255, 0.3);
                }

                .custom-address-input:hover {
                    border-color: #007bff;
                }

                .custom-suggestions-container {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 0;
                    z-index: 9999;
                    max-height: 300px;
                    overflow-y: auto;
                    background-color: #fff;
                    border: 1px solid #ced4da;
                    border-radius: 8px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
                    margin-top: 4px;
                }

                .custom-suggestions-container--open {
                    display: block !important;
                }

                .custom-suggestions-list {
                    list-style: none;
                    margin: 0;
                    padding: 0;
                }

                .custom-suggestion-item {
                    padding: 12px 16px;
                    font-size: 15px;
                    color: #333;
                    cursor: pointer;
                    transition: background-color 0.2s ease;
                }

                .custom-suggestion-item:hover {
                    background-color: #f1f3f5;
                }

                .custom-suggestion-highlighted {
                    background-color: #e9ecef;
                }
            `}</style>
        </div>
    );
};

export default Checkout;

// import React, { useState, useEffect } from "react";
// import { useCart } from "../CartContext";
// import { useNavigate } from "react-router-dom";
// import { formatPrice } from "../../utils/utils";
// import axios from "axios";
// import L from "leaflet";
// import "leaflet/dist/leaflet.css";
// import Autosuggest from "react-autosuggest";

// const Checkout = () => {
//     const { cart, getTotalPrice, clearCart } = useCart();
//     const navigate = useNavigate();

//     const [orderInfo, setOrderInfo] = useState({
//         userid: null,
//         diachinhanhang: "",
//         ngaydat: new Date().toISOString(),
//         trangthai: 1,
//     });

//     const [shippingFee, setShippingFee] = useState(0);
//     const [map, setMap] = useState(null);
//     const [userMarker, setUserMarker] = useState(null);
//     const [storeMarkers, setStoreMarkers] = useState([]);
//     const [suggestions, setSuggestions] = useState([]);
//     const [paymentMethod, setPaymentMethod] = useState("cod");
//     const [stores, setStores] = useState([]);
//     const [selectedStore, setSelectedStore] = useState(null);
//     const [route, setRoute] = useState(null);
//     const [estimatedDeliveryTime, setEstimatedDeliveryTime] = useState("");
//     const [isMapInitialized, setIsMapInitialized] = useState(false);

//     const API_KEY = "a9c5e3c067784ca496a593360cb32a19";

//     useEffect(() => {
//         const userid = localStorage.getItem("userid");
//         if (userid) {
//             setOrderInfo((prev) => ({ ...prev, userid }));
//         } else {
//             alert("Bạn cần đăng nhập trước khi thanh toán.");
//             navigate("/login");
//         }

//         const fetchStores = async () => {
//             try {
//                 const response = await axios.get("http://localhost:4000/api/stores");
//                 setStores(response.data);
//             } catch (error) {
//                 console.error("Lỗi khi lấy danh sách cửa hàng:", error);
//             }
//         };

//         fetchStores();

//         return () => {
//             if (map) {
//                 map.remove();
//             }
//         };
//     }, [navigate]);

//     useEffect(() => {
//         if (stores.length > 0 && !isMapInitialized) {
//             const firstStore = stores[0];
//             const mapInstance = L.map("map", { scrollWheelZoom: false }).setView(
//                 [firstStore.lat, firstStore.lng],
//                 13
//             );
//             L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
//                 maxZoom: 19,
//             }).addTo(mapInstance);

//             const storeIcon = L.icon({
//                 iconUrl: "http://localhost:4000/uploads/store.png",
//                 iconSize: [30, 30],
//                 iconAnchor: [15, 30],
//                 popupAnchor: [0, -30],
//             });

//             const newStoreMarkers = stores.map((store) => {
//                 const storeMarker = L.marker([store.lat, store.lng], { icon: storeIcon })
//                     .addTo(mapInstance)
//                     .bindPopup(`${store.tencuahang}<br>${store.diachi}`);
//                 return storeMarker;
//             });

//             setMap(mapInstance);
//             setStoreMarkers(newStoreMarkers);
//             setIsMapInitialized(true);
//         }
//     }, [stores]);

//     const calculateShippingFee = async (address) => {
//         if (!address) return;

//         try {
//             const parts = address.split(",").map((part) => part.trim());
//             let found = false;

//             for (let i = 0; i < parts.length; i++) {
//                 const partialAddress = parts.slice(i).join(", ");
//                 const response = await axios.get(
//                     `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(partialAddress)}&key=${API_KEY}&countrycode=VN`
//                 );

//                 const data = response.data;
//                 if (data.results && data.results.length > 0) {
//                     const { lat, lng } = data.results[0].geometry;

//                     const userIcon = L.icon({
//                         iconUrl: "http://localhost:4000/uploads/mui_ten.png",
//                         iconSize: [32, 32],
//                         iconAnchor: [16, 32],
//                         popupAnchor: [0, -32],
//                     });

//                     if (userMarker) {
//                         userMarker.setLatLng([lat, lng]).bindPopup(address).openPopup();
//                     } else if (map) {
//                         const newUserMarker = L.marker([lat, lng], { icon: userIcon })
//                             .addTo(map)
//                             .bindPopup(address)
//                             .openPopup();
//                         setUserMarker(newUserMarker);
//                     }

//                     let nearestStore = null;
//                     let minDistance = Infinity;

//                     stores.forEach((store) => {
//                         const distance = calculateDistance(lat, lng, store.lat, store.lng);
//                         if (distance < minDistance) {
//                             minDistance = distance;
//                             nearestStore = store;
//                         }
//                     });

//                     if (nearestStore) {
//                         setSelectedStore(nearestStore);
//                         await calculateRouteAndDeliveryTime(lat, lng, nearestStore);
//                     } else {
//                         alert("Không tìm thấy cửa hàng nào phù hợp.");
//                     }

//                     found = true;
//                     break;
//                 }
//             }

//             if (!found) {
//                 alert("Không tìm thấy tọa độ cho địa chỉ này. Vui lòng kiểm tra lại.");
//             }
//         } catch (error) {
//             console.error("Lỗi khi gọi OpenCage API:", error);
//             alert("Đã xảy ra lỗi khi kiểm tra địa chỉ. Vui lòng thử lại.");
//         }
//     };

//     const getAddressSuggestions = async (value) => {
//         try {
//             const response = await axios.get(
//                 `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(value)}&key=${API_KEY}&countrycode=VN`
//             );
//             const data = response.data;

//             if (data.results) {
//                 setSuggestions(data.results.map(result => result.formatted));
//             }
//         } catch (error) {
//             console.error("Lỗi khi lấy gợi ý địa chỉ:", error);
//         }
//     };

//     const handleSuggestionSelected = (event, { suggestion }) => {
//         setOrderInfo((prev) => ({ ...prev, diachinhanhang: suggestion }));
//     };

//     const calculateDistance = (lat1, lon1, lat2, lon2) => {
//         const R = 6371;
//         const dLat = ((lat2 - lat1) * Math.PI) / 180;
//         const dLon = ((lon2 - lon1) * Math.PI) / 180;
//         const a =
//             Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//             Math.cos((lat1 * Math.PI) / 180) *
//                 Math.cos((lat2 * Math.PI) / 180) *
//                 Math.sin(dLon / 2) *
//                 Math.sin(dLon / 2);
//         const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//         return R * c;
//     };

//     const calculateRouteAndDeliveryTime = async (userLat, userLng, store) => {
//         try {
//             const distance = calculateDistance(userLat, userLng, store.lat, store.lng);

//             let deliveryTime = "";
//             if (distance <= 5) deliveryTime = "Giao trong ngày";
//             else if (distance <= 20) deliveryTime = "Giao trong 1 ngày";
//             else deliveryTime = "Giao trong 2 ngày";
//             setEstimatedDeliveryTime(deliveryTime);

//             const isStoreInCanTho = /Cần Thơ|Ninh Kiều|Cái Răng|Bình Thủy|Ô Môn|Thốt Nốt|Phong Điền|Cờ Đỏ|Thới Lai/i.test(
//                 store.diachi
//             );

//             if (isStoreInCanTho) {
//                 if (distance <= 5) {
//                     setShippingFee(0);
//                 } else {
//                     setShippingFee(distance * 500);
//                 }
//             } else {
//                 setShippingFee(30000);
//             }

//             if (route) {
//                 map.removeLayer(route);
//             }

//             const response = await axios.get(
//                 `http://router.project-osrm.org/route/v1/driving/${userLng},${userLat};${store.lng},${store.lat}?overview=full&geometries=geojson`
//             );
//             const routeCoords = response.data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
//             const newRoute = L.polyline(routeCoords, { color: "blue" })
//                 .addTo(map)
//                 .bindPopup(`Đường đến ${store.tencuahang} (${distance.toFixed(2)} km)`);
//             setRoute(newRoute);
//             map.fitBounds(newRoute.getBounds());
//         } catch (error) {
//             console.error("Lỗi khi vẽ tuyến đường:", error);
//             alert("Không thể vẽ tuyến đường đến cửa hàng!");
//         }
//     };

//     const getCurrentLocation = async () => {
//         if (navigator.geolocation) {
//             navigator.geolocation.getCurrentPosition(
//                 async (position) => {
//                     const { latitude, longitude } = position.coords;
//                     try {
//                         const response = await axios.get(
//                             `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${API_KEY}`
//                         );
//                         const address = response.data.results[0].formatted;
//                         setOrderInfo((prev) => ({ ...prev, diachinhanhang: address }));
//                         await calculateShippingFee(address);
//                     } catch (error) {
//                         console.error("Lỗi khi lấy địa chỉ từ vị trí:", error);
//                         alert("Không thể lấy địa chỉ từ vị trí hiện tại.");
//                     }
//                 },
//                 (error) => {
//                     alert("Vui lòng cho phép truy cập vị trí để sử dụng tính năng này.");
//                 }
//             );
//         } else {
//             alert("Trình duyệt của bạn không hỗ trợ định vị.");
//         }
//     };

//     const handlePlaceOrder = async () => {
//         if (!orderInfo.diachinhanhang) {
//             alert("Vui lòng nhập địa chỉ nhận hàng.");
//             return;
//         }

//         try {
//             const orderData = {
//                 ...orderInfo,
//                 tonggia: Math.round(getTotalPrice() + shippingFee),
//                 chitietdonhang: cart.map((item) => ({
//                     masach: item.masach,
//                     gia: Math.round(item.gia),
//                     soluong: item.quantity,
//                 })),
//                 phuongthucthanhtoan: paymentMethod === "cod" ? "COD" : "VNPay",
//             };

//             if (paymentMethod === "cod") {
//                 const response = await axios.post("http://localhost:4000/api/orders", orderData);
//                 if (response.status === 200) {
//                     alert("Đặt hàng thành công!");
//                     clearCart();
//                     navigate("/cart");
//                 } else {
//                     alert(`Đặt hàng thất bại: ${response.data.message}`);
//                 }
//             } else if (paymentMethod === "online") {
//                 const response = await axios.post("http://localhost:4000/api/orders", orderData);
//                 if (response.status === 200) {
//                     const madh = response.data.madh;
//                     const amount = Math.round(orderData.tonggia);
//                     const paymentUrl = await createVNPayPayment(madh, amount);
//                     window.location.href = paymentUrl;
//                 } else {
//                     alert(`Đặt hàng thất bại: ${response.data.message}`);
//                 }
//             }
//         } catch (error) {
//             console.error("Lỗi đặt hàng:", error);
//             alert("Đã xảy ra lỗi, vui lòng thử lại sau.");
//         }
//     };

//     const createVNPayPayment = async (madh, amount) => {
//         try {
//             if (!madh || isNaN(amount) || amount <= 0) {
//                 throw new Error("Dữ liệu không hợp lệ: madh hoặc amount không đúng.");
//             }

//             const response = await axios.post("http://localhost:4000/api/create-payment", {
//                 madh: String(madh),
//                 amount: Number(amount),
//                 returnUrl: "http://localhost:4000/payment-return",
//             });

//             return response.data.paymentUrl;
//         } catch (error) {
//             console.error("Lỗi khi tạo URL thanh toán VNPay:", error);
//             alert("Không thể tạo URL thanh toán, vui lòng thử lại sau.");
//             throw error;
//         }
//     };

//     const handleInputBlur = async () => {
//         if (orderInfo.diachinhanhang.trim() !== "") {
//             await calculateShippingFee(orderInfo.diachinhanhang.trim());
//         }
//     };

//     const inputProps = {
//         placeholder: "Nhập địa chỉ nhận hàng (ví dụ: 123 Nguyễn Văn Cừ, quận Ninh Kiều, Cần Thơ)",
//         value: orderInfo.diachinhanhang,
//         onChange: (e, { newValue }) => {
//             setOrderInfo((prev) => ({ ...prev, diachinhanhang: newValue }));
//             if (newValue.trim() === "") {
//                 setShippingFee(0);
//             }
//         },
//         onBlur: handleInputBlur,
//         onKeyPress: (e) => {
//             if (e.key === "Enter") {
//                 handleInputBlur();
//             }
//         },
//         className: "custom-address-input", // Thêm class để áp dụng CSS
//     };

//     // Hàm tùy chỉnh giao diện của gợi ý
//     const renderSuggestion = (suggestion) => (
//         <div className="custom-suggestion-item">
//             {suggestion}
//         </div>
//     );

//     return (
//         <div className="container my-5">
//             <h2 className="text-center mb-4">Thông Tin Đặt Hàng</h2>

//             <div className="row flex-column">
//                 <div className="card p-4 shadow-sm mb-4">
//                     <label htmlFor="diachinhanhang" className="form-label">Địa chỉ nhận hàng:</label>
//                     <Autosuggest
//                         suggestions={suggestions}
//                         onSuggestionsFetchRequested={({ value }) => getAddressSuggestions(value)}
//                         onSuggestionsClearRequested={() => setSuggestions([])} // Xóa gợi ý khi không cần thiết
//                         onSuggestionSelected={handleSuggestionSelected}
//                         getSuggestionValue={(suggestion) => suggestion}
//                         renderSuggestion={renderSuggestion} // Sử dụng hàm render tùy chỉnh
//                         inputProps={inputProps}
//                         theme={{
//                             container: 'autosuggest-container',
//                             suggestionsContainer: 'custom-suggestions-container',
//                             suggestionsList: 'custom-suggestions-list',
//                             suggestion: 'custom-suggestion',
//                             suggestionHighlighted: 'custom-suggestion-highlighted',
//                         }}
//                     />
//                     <button className="btn btn-primary mt-2" onClick={getCurrentLocation}>
//                         Lấy vị trí hiện tại
//                     </button>
//                     {selectedStore && (
//                         <div className="mt-3">
//                             <h6>Cửa hàng giao hàng:</h6>
//                             <p>{selectedStore.tencuahang} - {selectedStore.diachi}</p>
//                             {userMarker && (
//                                 <>
//                                     <p>
//                                         Khoảng cách: {calculateDistance(
//                                             userMarker.getLatLng().lat,
//                                             userMarker.getLatLng().lng,
//                                             selectedStore.lat,
//                                             selectedStore.lng
//                                         ).toFixed(2)} km
//                                     </p>
//                                     <p>Thời gian giao hàng dự kiến: {estimatedDeliveryTime}</p>
//                                 </>
//                             )}
//                         </div>
//                     )}
//                 </div>

//                 <div className="card p-4 shadow-sm mb-4">
//                     <div id="map" style={{ height: "300px", width: "100%" }}></div>
//                 </div>

//                 <div className="card p-4 shadow-sm mb-4">
//                     <h5 className="mb-3">Thông Tin Sản Phẩm</h5>
//                     <table className="table table-bordered">
//                         <thead>
//                             <tr>
//                                 <th className="text-center">STT</th>
//                                 <th className="text-center">Hình ảnh</th>
//                                 <th className="text-center">Tên sản phẩm</th>
//                                 <th className="text-center">Số lượng</th>
//                                 <th className="text-center">Giá tiền</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {cart.map((item, index) => (
//                                 <tr key={item.masach}>
//                                     <td className="text-center">{index + 1}</td>
//                                     <td className="text-center">
//                                         <img
//                                             src={`http://localhost:4000/uploads/${item.hinhanh}`}
//                                             alt={item.tenSP}
//                                             className="img-fluid"
//                                             style={{ maxWidth: '50px' }}
//                                         />
//                                     </td>
//                                     <td className="text-center">{item.tenSP}</td>
//                                     <td className="text-center">{item.quantity}</td>
//                                     <td className="text-center">{formatPrice(item.gia * item.quantity)}</td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>

//                 <div className="card p-4 shadow-sm mb-4">
//                     <div className="d-flex justify-content-between align-items-center mb-3">
//                         <h5>Phương thức thanh toán:</h5>
//                         <div>
//                             <label className="me-3">
//                                 <input
//                                     type="radio"
//                                     value="cod"
//                                     checked={paymentMethod === "cod"}
//                                     onChange={(e) => setPaymentMethod(e.target.value)}
//                                 />
//                                 Thanh toán khi nhận hàng
//                             </label>
//                             <label>
//                                 <input
//                                     type="radio"
//                                     value="online"
//                                     checked={paymentMethod === "online"}
//                                     onChange={(e) => setPaymentMethod(e.target.value)}
//                                 />
//                                 Thanh toán online (VNPay)
//                             </label>
//                         </div>
//                     </div>
//                     <h5>Phí vận chuyển: <span className="text-primary">{formatPrice(shippingFee)}</span></h5>
//                     <h5>Tổng tiền: <span className="text-danger">{formatPrice(getTotalPrice() + shippingFee)}</span></h5>
//                 </div>

//                 <button className="btn btn-success w-100" onClick={handlePlaceOrder}>
//                     Xác Nhận Đặt Hàng
//                 </button>
//             </div>

//             {/* CSS tùy chỉnh */}
//             <style>{`
//                 /* Định dạng ô nhập địa chỉ */
//                 .custom-address-input {
//                     width: 100%;
//                     height: 50px;
//                     padding: 12px 16px;
//                     font-size: 16px;
//                     border: 1px solid #ced4da;
//                     border-radius: 8px;
//                     box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
//                     transition: all 0.3s ease;
//                     outline: none;
//                 }

//                 .custom-address-input:focus {
//                     border-color: #007bff;
//                     box-shadow: 0 0 8px rgba(0, 123, 255, 0.3);
//                 }

//                 .custom-address-input:hover {
//                     border-color: #007bff;
//                 }

//                 /* Định dạng container của Autosuggest */
//                 .autosuggest-container {
//                     position: relative;
//                     width: 100%;
//                 }

//                 /* Định dạng container của danh sách gợi ý */
//                 .custom-suggestions-container {
//                     display: none;
//                     position: absolute;
//                     top: 100%;
//                     left: 0;
//                     right: 0;
//                     z-index: 1000;
//                     max-height: 300px;
//                     overflow-y: auto;
//                     background-color: #fff;
//                     border: 1px solid #ced4da;
//                     border-radius: 8px;
//                     box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
//                     margin-top: 4px;
//                 }

//                 .custom-suggestions-container--open {
//                     display: block;
//                 }

//                 /* Định dạng danh sách gợi ý */
//                 .custom-suggestions-list {
//                     list-style: none;
//                     margin: 0;
//                     padding: 0;
//                 }

//                 /* Định dạng mỗi gợi ý */
//                 .custom-suggestion-item {
//                     padding: 12px 16px;
//                     font-size: 15px;
//                     color: #333;
//                     cursor: pointer;
//                     transition: background-color 0.2s ease;
//                 }

//                 .custom-suggestion-item:hover {
//                     background-color: #f1f3f5;
//                 }

//                 /* Định dạng gợi ý khi được chọn (highlighted) */
//                 .custom-suggestion-highlighted {
//                     background-color: #e9ecef;
//                 }
//             `}</style>
//         </div>
//     );
// };

// export default Checkout;

// import React, { useState, useEffect } from "react";
// import { useCart } from "../CartContext";
// import { useNavigate } from "react-router-dom";
// import { formatPrice } from "../../utils/utils";
// import axios from "axios";
// import L from "leaflet";
// import "leaflet/dist/leaflet.css";
// import Autosuggest from "react-autosuggest";

// const Checkout = () => {
//     const { cart, getTotalPrice, clearCart } = useCart();
//     const navigate = useNavigate();

//     const [orderInfo, setOrderInfo] = useState({
//         userid: null,
//         diachinhanhang: "",
//         ngaydat: new Date().toISOString(),
//         trangthai: 1,
//     });

//     const [shippingFee, setShippingFee] = useState(0);
//     const [map, setMap] = useState(null);
//     const [userMarker, setUserMarker] = useState(null);
//     const [storeMarkers, setStoreMarkers] = useState([]);
//     const [suggestions, setSuggestions] = useState([]);
//     const [paymentMethod, setPaymentMethod] = useState("cod");
//     const [stores, setStores] = useState([]);
//     const [selectedStore, setSelectedStore] = useState(null);
//     const [route, setRoute] = useState(null);
//     const [estimatedDeliveryTime, setEstimatedDeliveryTime] = useState("");
//     const [isMapInitialized, setIsMapInitialized] = useState(false);

//     const API_KEY = "a9c5e3c067784ca496a593360cb32a19";

//     useEffect(() => {
//         const userid = localStorage.getItem("userid");
//         if (userid) {
//             setOrderInfo((prev) => ({ ...prev, userid }));
//         } else {
//             alert("Bạn cần đăng nhập trước khi thanh toán.");
//             navigate("/login");
//         }

//         const fetchStores = async () => {
//             try {
//                 const response = await axios.get("http://localhost:4000/api/stores");
//                 setStores(response.data);
//             } catch (error) {
//                 console.error("Lỗi khi lấy danh sách cửa hàng:", error);
//             }
//         };

//         fetchStores();

//         return () => {
//             if (map) {
//                 map.remove();
//             }
//         };
//     }, [navigate]);

//     useEffect(() => {
//         if (stores.length > 0 && !isMapInitialized) {
//             const firstStore = stores[0]; // Hiển thị bản đồ với cửa hàng đầu tiên (sẽ cập nhật sau khi người dùng nhập địa chỉ)

//             const mapInstance = L.map("map", { scrollWheelZoom: false }).setView(
//                 [firstStore.lat, firstStore.lng],
//                 13
//             );
//             L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
//                 maxZoom: 19,
//             }).addTo(mapInstance);

//             const storeIcon = L.icon({
//                 iconUrl: "http://localhost:4000/uploads/store.png",
//                 iconSize: [30, 30],
//                 iconAnchor: [15, 30],
//                 popupAnchor: [0, -30],
//             });

//             const newStoreMarkers = stores.map((store) => {
//                 const storeMarker = L.marker([store.lat, store.lng], { icon: storeIcon })
//                     .addTo(mapInstance)
//                     .bindPopup(`${store.tencuahang}<br>${store.diachi}`);
//                 return storeMarker;
//             });

//             setMap(mapInstance);
//             setStoreMarkers(newStoreMarkers);
//             setIsMapInitialized(true);
//         }
//     }, [stores]);

//     const calculateShippingFee = async (address) => {
//         if (!address) return;

//         try {
//             const parts = address.split(",").map((part) => part.trim());
//             let found = false;

//             for (let i = 0; i < parts.length; i++) {
//                 const partialAddress = parts.slice(i).join(", ");
//                 const response = await axios.get(
//                     `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(partialAddress)}&key=${API_KEY}&countrycode=VN`
//                 );

//                 const data = response.data;
//                 if (data.results && data.results.length > 0) {
//                     const { lat, lng } = data.results[0].geometry;

//                     const userIcon = L.icon({
//                         iconUrl: "http://localhost:4000/uploads/mui_ten.png",
//                         iconSize: [32, 32],
//                         iconAnchor: [16, 32],
//                         popupAnchor: [0, -32],
//                     });

//                     if (userMarker) {
//                         userMarker.setLatLng([lat, lng]).bindPopup(address).openPopup();
//                     } else if (map) {
//                         const newUserMarker = L.marker([lat, lng], { icon: userIcon })
//                             .addTo(map)
//                             .bindPopup(address)
//                             .openPopup();
//                         setUserMarker(newUserMarker);
//                     }

//                     // Tìm cửa hàng gần nhất
//                     let nearestStore = null;
//                     let minDistance = Infinity;

//                     stores.forEach((store) => {
//                         const distance = calculateDistance(lat, lng, store.lat, store.lng);
//                         if (distance < minDistance) {
//                             minDistance = distance;
//                             nearestStore = store;
//                         }
//                     });

//                     if (nearestStore) {
//                         setSelectedStore(nearestStore);
//                         await calculateRouteAndDeliveryTime(lat, lng, nearestStore);
//                     } else {
//                         alert("Không tìm thấy cửa hàng nào phù hợp.");
//                     }

//                     found = true;
//                     break;
//                 }
//             }

//             // if (!found) {
//             //     alert("Không tìm thấy tọa độ cho địa chỉ này. Vui lòng kiểm tra lại.");
//             // }
//         } catch (error) {
//             console.error("Lỗi khi gọi OpenCage API:", error);
//             alert("Đã xảy ra lỗi khi kiểm tra địa chỉ. Vui lòng thử lại.");
//         }
//     };

//     const getAddressSuggestions = async (value) => {
//         try {
//             const response = await axios.get(
//                 `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(value)}&key=${API_KEY}&countrycode=VN`
//             );
//             const data = response.data;

//             if (data.results) {
//                 setSuggestions(data.results.map(result => result.formatted));
//             }
//         } catch (error) {
//             console.error("Lỗi khi lấy gợi ý địa chỉ:", error);
//         }
//     };

//     const handleSuggestionSelected = (event, { suggestion }) => {
//         setOrderInfo((prev) => ({ ...prev, diachinhanhang: suggestion }));
//     };

//     const calculateDistance = (lat1, lon1, lat2, lon2) => {
//         const R = 6371;
//         const dLat = ((lat2 - lat1) * Math.PI) / 180;
//         const dLon = ((lon2 - lon1) * Math.PI) / 180;
//         const a =
//             Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//             Math.cos((lat1 * Math.PI) / 180) *
//                 Math.cos((lat2 * Math.PI) / 180) *
//                 Math.sin(dLon / 2) *
//                 Math.sin(dLon / 2);
//         const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//         return R * c;
//     };

//     const calculateRouteAndDeliveryTime = async (userLat, userLng, store) => {
//         try {
//             const distance = calculateDistance(userLat, userLng, store.lat, store.lng);

//             let deliveryTime = "";
//             if (distance <= 5) deliveryTime = "Giao trong ngày";
//             else if (distance <= 20) deliveryTime = "Giao trong 1 ngày";
//             else deliveryTime = "Giao trong 2 ngày";
//             setEstimatedDeliveryTime(deliveryTime);

//             // Xác định cửa hàng có nằm ở nội thành Cần Thơ hay không
//             const isStoreInCanTho = /Cần Thơ|Ninh Kiều|Cái Răng|Bình Thủy|Ô Môn|Thốt Nốt|Phong Điền|Cờ Đỏ|Thới Lai/i.test(
//                 store.diachi
//             );

//             if (isStoreInCanTho) {
//                 // Cửa hàng ở nội thành Cần Thơ
//                 if (distance <= 5) {
//                     setShippingFee(0); // Miễn phí ship nếu dưới 5km
//                 } else {
//                     setShippingFee(distance * 500); // 500 VNĐ/km nếu trên 5km
//                 }
//             } else {
//                 // Cửa hàng ở ngoại thành
//                 setShippingFee(30000); // Phí cố định 30,000 VNĐ
//             }

//             if (route) {
//                 map.removeLayer(route);
//             }

//             const response = await axios.get(
//                 `http://router.project-osrm.org/route/v1/driving/${userLng},${userLat};${store.lng},${store.lat}?overview=full&geometries=geojson`
//             );
//             const routeCoords = response.data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
//             const newRoute = L.polyline(routeCoords, { color: "blue" })
//                 .addTo(map)
//                 .bindPopup(`Đường đến ${store.tencuahang} (${distance.toFixed(2)} km)`);
//             setRoute(newRoute);
//             map.fitBounds(newRoute.getBounds());
//         } catch (error) {
//             console.error("Lỗi khi vẽ tuyến đường:", error);
//             alert("Không thể vẽ tuyến đường đến cửa hàng!");
//         }
//     };

//     const getCurrentLocation = async () => {
//         if (navigator.geolocation) {
//             navigator.geolocation.getCurrentPosition(
//                 async (position) => {
//                     const { latitude, longitude } = position.coords;
//                     try {
//                         const response = await axios.get(
//                             `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${API_KEY}`
//                         );
//                         const address = response.data.results[0].formatted;
//                         setOrderInfo((prev) => ({ ...prev, diachinhanhang: address }));
//                         await calculateShippingFee(address);
//                     } catch (error) {
//                         console.error("Lỗi khi lấy địa chỉ từ vị trí:", error);
//                         alert("Không thể lấy địa chỉ từ vị trí hiện tại.");
//                     }
//                 },
//                 (error) => {
//                     alert("Vui lòng cho phép truy cập vị trí để sử dụng tính năng này.");
//                 }
//             );
//         } else {
//             alert("Trình duyệt của bạn không hỗ trợ định vị.");
//         }
//     };

//     const handlePlaceOrder = async () => {
//         if (!orderInfo.diachinhanhang) {
//             alert("Vui lòng nhập địa chỉ nhận hàng.");
//             return;
//         }

//         try {
//             const orderData = {
//                 ...orderInfo,
//                 tonggia: Math.round(getTotalPrice() + shippingFee),
//                 chitietdonhang: cart.map((item) => ({
//                     masach: item.masach,
//                     gia: Math.round(item.gia),
//                     soluong: item.quantity,
//                 })),
//                 phuongthucthanhtoan: paymentMethod === "cod" ? "COD" : "VNPay",
//             };

//             if (paymentMethod === "cod") {
//                 const response = await axios.post("http://localhost:4000/api/orders", orderData);
//                 if (response.status === 200) {
//                     alert("Đặt hàng thành công!");
//                     clearCart();
//                     navigate("/cart");
//                 } else {
//                     alert(`Đặt hàng thất bại: ${response.data.message}`);
//                 }
//             } else if (paymentMethod === "online") {
//                 const response = await axios.post("http://localhost:4000/api/orders", orderData);
//                 if (response.status === 200) {
//                     const madh = response.data.madh;
//                     const amount = Math.round(orderData.tonggia);
//                     const paymentUrl = await createVNPayPayment(madh, amount);
//                     window.location.href = paymentUrl;
//                 } else {
//                     alert(`Đặt hàng thất bại: ${response.data.message}`);
//                 }
//             }
//         } catch (error) {
//             console.error("Lỗi đặt hàng:", error);
//             alert("Đã xảy ra lỗi, vui lòng thử lại sau.");
//         }
//     };

//     const createVNPayPayment = async (madh, amount) => {
//         try {
//             if (!madh || isNaN(amount) || amount <= 0) {
//                 throw new Error("Dữ liệu không hợp lệ: madh hoặc amount không đúng.");
//             }

//             const response = await axios.post("http://localhost:4000/api/create-payment", {
//                 madh: String(madh),
//                 amount: Number(amount),
//                 returnUrl: "http://localhost:4000/payment-return",
//             });

//             return response.data.paymentUrl;
//         } catch (error) {
//             console.error("Lỗi khi tạo URL thanh toán VNPay:", error);
//             alert("Không thể tạo URL thanh toán, vui lòng thử lại sau.");
//             throw error;
//         }
//     };

//     const handleInputBlur = async () => {
//         if (orderInfo.diachinhanhang.trim() !== "") {
//             await calculateShippingFee(orderInfo.diachinhanhang.trim());
//         }
//     };

//     const inputProps = {
//         placeholder: "Nhập địa chỉ nhận hàng",
//         value: orderInfo.diachinhanhang,
//         onChange: (e, { newValue }) => {
//             setOrderInfo((prev) => ({ ...prev, diachinhanhang: newValue }));
//             if (newValue.trim() === "") {
//                 setShippingFee(0);
//             }
//         },
//         onBlur: handleInputBlur,
//         onKeyPress: (e) => {
//             if (e.key === "Enter") {
//                 handleInputBlur();
//             }
//         },
//     };

//     return (
//         <div className="container my-5">
//             <h2 className="text-center mb-4">Thông Tin Đặt Hàng</h2>

//             <div className="row flex-column">
//                 <div className="card p-4 shadow-sm mb-4">
//                     <label htmlFor="diachinhanhang" className="form-label">Địa chỉ nhận hàng:</label>
//                     <Autosuggest
//                         suggestions={suggestions}
//                         onSuggestionsFetchRequested={({ value }) => getAddressSuggestions(value)}
//                         onSuggestionSelected={handleSuggestionSelected}
//                         getSuggestionValue={(suggestion) => suggestion}
//                         renderSuggestion={(suggestion) => <div>{suggestion}</div>}
//                         inputProps={inputProps}
//                     />
//                     <button className="btn btn-primary mt-2" onClick={getCurrentLocation}>
//                         Lấy vị trí hiện tại
//                     </button>
//                     {selectedStore && (
//                         <div className="mt-3">
//                             <h6>Cửa hàng giao hàng:</h6>
//                             <p>{selectedStore.tencuahang} - {selectedStore.diachi}</p>
//                             {userMarker && (
//                                 <>
//                                     <p>
//                                         Khoảng cách: {calculateDistance(
//                                             userMarker.getLatLng().lat,
//                                             userMarker.getLatLng().lng,
//                                             selectedStore.lat,
//                                             selectedStore.lng
//                                         ).toFixed(2)} km
//                                     </p>
//                                     <p>Thời gian giao hàng dự kiến: {estimatedDeliveryTime}</p>
//                                 </>
//                             )}
//                         </div>
//                     )}
//                 </div>

//                 <div className="card p-4 shadow-sm mb-4">
//                     <div id="map" style={{ height: "300px", width: "100%" }}></div>
//                 </div>

//                 <div className="card p-4 shadow-sm mb-4">
//                     <h5 className="mb-3">Thông Tin Sản Phẩm</h5>
//                     <table className="table table-bordered">
//                         <thead>
//                             <tr>
//                                 <th className="text-center">STT</th>
//                                 <th className="text-center">Hình ảnh</th>
//                                 <th className="text-center">Tên sản phẩm</th>
//                                 <th className="text-center">Số lượng</th>
//                                 <th className="text-center">Giá tiền</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {cart.map((item, index) => (
//                                 <tr key={item.masach}>
//                                     <td className="text-center">{index + 1}</td>
//                                     <td className="text-center">
//                                         <img
//                                             src={`http://localhost:4000/uploads/${item.hinhanh}`}
//                                             alt={item.tenSP}
//                                             className="img-fluid"
//                                             style={{ maxWidth: '50px' }}
//                                         />
//                                     </td>
//                                     <td className="text-center">{item.tenSP}</td>
//                                     <td className="text-center">{item.quantity}</td>
//                                     <td className="text-center">{formatPrice(item.gia * item.quantity)}</td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>

//                 <div className="card p-4 shadow-sm mb-4">
//                     <div className="d-flex justify-content-between align-items-center mb-3">
//                         <h5>Phương thức thanh toán:</h5>
//                         <div>
//                             <label className="me-3">
//                                 <input
//                                     type="radio"
//                                     value="cod"
//                                     checked={paymentMethod === "cod"}
//                                     onChange={(e) => setPaymentMethod(e.target.value)}
//                                 />
//                                 Thanh toán khi nhận hàng
//                             </label>
//                             <label>
//                                 <input
//                                     type="radio"
//                                     value="online"
//                                     checked={paymentMethod === "online"}
//                                     onChange={(e) => setPaymentMethod(e.target.value)}
//                                 />
//                                 Thanh toán online (VNPay)
//                             </label>
//                         </div>
//                     </div>
//                     <h5>Phí vận chuyển: <span className="text-primary">{formatPrice(shippingFee)}</span></h5>
//                     <h5>Tổng tiền: <span className="text-danger">{formatPrice(getTotalPrice() + shippingFee)}</span></h5>
//                 </div>

//                 <button className="btn btn-success w-100" onClick={handlePlaceOrder}>
//                     Xác Nhận Đặt Hàng
//                 </button>
//             </div>
//         </div>
//     );
// };

// export default Checkout;

// import React, { useState, useEffect } from "react";
// import { useCart } from "../CartContext";
// import { useNavigate } from "react-router-dom";
// import { formatPrice } from "../../utils/utils";
// import axios from "axios";
// import L from "leaflet";
// import "leaflet/dist/leaflet.css";
// import Autosuggest from "react-autosuggest";

// const Checkout = () => {
//     const { cart, getTotalPrice, clearCart } = useCart();
//     const navigate = useNavigate();

//     const [orderInfo, setOrderInfo] = useState({
//         userid: null,
//         diachinhanhang: "",
//         ngaydat: new Date().toISOString(),
//         trangthai: 1,
//     });

//     const [shippingFee, setShippingFee] = useState(0);
//     const [map, setMap] = useState(null);
//     const [marker, setMarker] = useState(null);
//     const [suggestions, setSuggestions] = useState([]);

//     const API_KEY = "a9c5e3c067784ca496a593360cb32a19";
    
//     useEffect(() => {
//         const userid = localStorage.getItem("userid");
//         if (userid) {
//             setOrderInfo((prev) => ({ ...prev, userid }));
//         } else {
//             alert("Bạn cần đăng nhập trước khi thanh toán.");
//             navigate("/login");
//         }

//         const getCoordinatesFromAddress = async (address) => {
//             try {
//                 const response = await axios.get(
//                     `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(address)}&key=${API_KEY}`
//                 );
//                 const data = response.data;
//                 if (data.results && data.results.length > 0) {
//                     const { lat, lng } = data.results[0].geometry;

//                     const mapInstance = L.map("map", { scrollWheelZoom: false }).setView([lat, lng], 13);
//                     L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
//                         maxZoom: 19,
//                     }).addTo(mapInstance);

//                     const customIcon = L.icon({
//                         iconUrl: "http://localhost:4000/uploads/mui_ten.png",
//                         iconSize: [32, 32],
//                         iconAnchor: [16, 32],
//                         popupAnchor: [0, -32],
//                     });

//                     const newMarker = L.marker([lat, lng], { icon: customIcon }).addTo(mapInstance)
//                         .bindPopup("Địa điểm mặc định")
//                         .openPopup();

//                     setMap(mapInstance);
//                     setMarker(newMarker);
//                 } else {
//                     alert("Không tìm thấy tọa độ cho địa chỉ này.");
//                 }
//             } catch (error) {
//                 console.error("Lỗi khi lấy tọa độ từ địa chỉ:", error);
//             }
//         };

//         getCoordinatesFromAddress("149 Nguyễn Đệ, phường An Hòa, quận Ninh Kiều, Cần Thơ");

//         return () => {
//             if (map) {
//                 map.remove();
//             }
//         };
//     }, [navigate, map]);

//     const getAddressSuggestions = async (value) => {
//         try {
//             const response = await axios.get(
//                 `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(value)}&key=${API_KEY}&countrycode=VN`
//             );
//             const data = response.data;

//             if (data.results) {
//                 setSuggestions(data.results.map(result => result.formatted));
//             }
//         } catch (error) {
//             console.error("Lỗi khi lấy gợi ý địa chỉ:", error);
//         }
//     };

//     const handleSuggestionSelected = async (event, { suggestion }) => {
//         setOrderInfo((prev) => ({ ...prev, diachinhanhang: suggestion }));
//         await calculateShippingFee(suggestion);
//     };

//     const calculateShippingFee = async (address) => {
//         try {
//             const parts = address.split(",").map((part) => part.trim());
//             let found = false;
    
//             for (let i = 0; i < parts.length; i++) {
//                 const partialAddress = parts.slice(i).join(", ");
//                 const response = await axios.get(
//                     `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(partialAddress)}&key=${API_KEY}&countrycode=VN`
//                 );
    
//                 const data = response.data;
//                 if (data.results && data.results.length > 0) {
//                     const { lat, lng } = data.results[0].geometry;
    
//                     if (marker) {
//                         marker.setLatLng([lat, lng]).bindPopup(address).openPopup();
//                     } else if (map) {
//                         const customIcon = L.icon({
//                             iconUrl: "http://localhost:4000/uploads/mui_ten.png",
//                             iconSize: [32, 32],
//                             iconAnchor: [16, 32],
//                             popupAnchor: [0, -32],
//                         });
    
//                         const newMarker = L.marker([lat, lng], { icon: customIcon })
//                             .addTo(map)
//                             .bindPopup(address)
//                             .openPopup();
    
//                         setMarker(newMarker);
//                     }
    
//                     const warehouse = { lat: 10.028141, lng: 105.769229 }; // Vị trí kho cố định
//                     const distance = calculateDistance(
//                         warehouse.lat,
//                         warehouse.lng,
//                         lat,
//                         lng
//                     );
    
//                     setShippingFee(distance <= 5 ? 0 : distance * 500); // Nội thành miễn phí ship
//                     found = true;
//                     break;
//                 }
//             }
    
//             if (!found) {
//                 alert("Không tìm thấy tọa độ cho địa chỉ này. Vui lòng kiểm tra lại.");
//             }
//         } catch (error) {
//             console.error("Lỗi khi gọi OpenCage API:", error);
//         }
//     };    

//     const calculateDistance = (lat1, lon1, lat2, lon2) => {
//         const R = 6371;
//         const dLat = ((lat2 - lat1) * Math.PI) / 180;
//         const dLon = ((lon2 - lon1) * Math.PI) / 180;
//         const a =
//             Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//             Math.cos((lat1 * Math.PI) / 180) *
//                 Math.cos((lat2 * Math.PI) / 180) *
//                 Math.sin(dLon / 2) *
//                 Math.sin(dLon / 2);
//         const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//         return R * c;
//     };

//     const handlePlaceOrder = async () => {
//         if (!orderInfo.diachinhanhang) {
//             alert("Vui lòng nhập địa chỉ nhận hàng.");
//             return;
//         }

//         try {
//             const orderData = {
//                 ...orderInfo,
//                 tonggia: getTotalPrice() + shippingFee,
//                 chitietdonhang: cart.map((item) => ({
//                     masach: item.masach,
//                     gia: item.gia,
//                     soluong: item.quantity,
//                 })),
//             };

//             const response = await axios.post("http://localhost:4000/api/orders", orderData);

//             if (response.status === 200) {
//                 alert("Đặt hàng thành công!");
//                 clearCart();
//                 navigate("/cart");
//             } else {
//                 alert(`Đặt hàng thất bại: ${response.data.message}`);
//             }
//         } catch (error) {
//             console.error("Lỗi đặt hàng:", error);
//             alert("Đã xảy ra lỗi, vui lòng thử lại sau.");
//         }
//     };

//     const handleInputBlur = async () => {
//         if (orderInfo.diachinhanhang.trim() !== "") {
//             await calculateShippingFee(orderInfo.diachinhanhang.trim());
//         }
//     };
    
//     const inputProps = {
//         placeholder: "Nhập địa chỉ nhận hàng",
//         value: orderInfo.diachinhanhang,
//         onChange: (e, { newValue }) => {
//             setOrderInfo((prev) => ({ ...prev, diachinhanhang: newValue }));
//             if (newValue.trim() === "") {
//                 setShippingFee(0); // Xóa phí vận chuyển khi địa chỉ bị xóa
//             }
//         },
//         onBlur: handleInputBlur,
//         onKeyPress: (e) => {
//             if (e.key === "Enter") {
//                 handleInputBlur();
//             }
//         },
//     };

//     return (
//         <div className="container my-5">
//             <h2 className="text-center mb-4">Thông Tin Đặt Hàng</h2>
    
//             <div className="row flex-column">
//                 {/* Địa chỉ nhận hàng */}
//                 <div className="card p-4 shadow-sm mb-4">
//                     <label htmlFor="diachinhanhang" className="form-label">Địa chỉ nhận hàng:</label>
//                     <Autosuggest
//                         suggestions={suggestions}
//                         onSuggestionsFetchRequested={({ value }) => getAddressSuggestions(value)}
//                         onSuggestionSelected={handleSuggestionSelected}
//                         getSuggestionValue={(suggestion) => suggestion}
//                         renderSuggestion={(suggestion) => <div>{suggestion}</div>}
//                         inputProps={inputProps}
//                     />
//                 </div>
    
//                 {/* Bản đồ */}
//                 <div className="card p-4 shadow-sm mb-4">
//                     <div id="map" style={{ height: "300px", width: "100%" }}></div>
//                 </div>
                    
//                 {/* Thông tin sản phẩm */}
//                 <div className="card p-4 shadow-sm mb-4">
//                     <h5 className="mb-3">Thông Tin Sản Phẩm</h5>
//                     <table className="table table-bordered">
//                         <thead>
//                             <tr>
//                                 <th className="text-center">STT</th>
//                                 <th className="text-center">Hình ảnh</th>
//                                 <th className="text-center">Tên sản phẩm</th>
//                                 <th className="text-center">Số lượng</th>
//                                 <th className="text-center">Giá tiền</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {cart.map((item, index) => (
//                                 <tr key={item.masach}>
//                                     {/* Số thứ tự */}
//                                     <td className="text-center">{index + 1}</td>

//                                     {/* Hình ảnh sản phẩm */}
//                                     <td className="text-center">
//                                         <img
//                                             src={`http://localhost:4000/uploads/${item.hinhanh}`}
//                                             alt={item.tenSP}
//                                             className="img-fluid"
//                                             style={{ maxWidth: '50px' }}
//                                         />
//                                     </td>

//                                     {/* Tên sản phẩm */}
//                                     <td className="text-center">{item.tenSP}</td>

//                                     {/* Số lượng sản phẩm */}
//                                     <td className="text-center">{item.quantity}</td>

//                                     {/* Giá tiền sản phẩm (số lượng * giá đơn) */}
//                                     <td className="text-center">{formatPrice(item.gia * item.quantity)}</td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>
    
//                 {/* Phí vận chuyển và Tổng tiền */}
//                 <div className="card p-4 shadow-sm mb-4">
//                     <div className="d-flex justify-content-between align-items-center mb-3">
//                         <h5>Phương thức thanh toán:</h5>
//                         <div>
//                             <p className="m-0">Thanh toán khi nhận hàng</p>
//                             {/* <button className="btn btn-link p-0" style={{ fontSize: '14px', color: '#007bff' }}>
//                                 THAY ĐỔI
//                             </button> */}
//                         </div>
//                     </div>
//                     <h5>Phí vận chuyển: <span className="text-primary">{formatPrice(shippingFee)}</span></h5>
//                     <h5>Tổng tiền: <span className="text-danger">{formatPrice(getTotalPrice() + shippingFee)}</span></h5>
//                 </div>
    
//                 {/* Nút xác nhận đặt hàng */}
//                 <button className="btn btn-success w-100" onClick={handlePlaceOrder}>
//                     Xác Nhận Đặt Hàng
//                 </button>
//             </div>
//         </div>
//     );    
// };

// export default Checkout;

// import React, { useState, useEffect } from "react";
// import { useCart } from "../CartContext";
// import { useNavigate } from "react-router-dom";
// import { formatPrice } from "../../utils/utils";
// import axios from "axios";
// import L from "leaflet";
// import "leaflet/dist/leaflet.css";
// import Autosuggest from "react-autosuggest";

// const Checkout = () => {
//     const { cart, getTotalPrice, clearCart } = useCart();
//     const navigate = useNavigate();

//     const [orderInfo, setOrderInfo] = useState({
//         userid: null,
//         diachinhanhang: "",
//         ngaydat: new Date().toISOString(),
//         trangthai: 1,
//     });

//     const [shippingFee, setShippingFee] = useState(0);
//     const [map, setMap] = useState(null);
//     const [marker, setMarker] = useState(null);
//     const [suggestions, setSuggestions] = useState([]);
//     const [paymentMethod, setPaymentMethod] = useState("cod"); // "cod" hoặc "online"

//     const API_KEY = "a9c5e3c067784ca496a593360cb32a19";

//     useEffect(() => {
//         const userid = localStorage.getItem("userid");
//         if (userid) {
//             setOrderInfo((prev) => ({ ...prev, userid }));
//         } else {
//             alert("Bạn cần đăng nhập trước khi thanh toán.");
//             navigate("/login");
//         }

//         const getCoordinatesFromAddress = async (address) => {
//             try {
//                 const response = await axios.get(
//                     `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(address)}&key=${API_KEY}`
//                 );
//                 const data = response.data;
//                 if (data.results && data.results.length > 0) {
//                     const { lat, lng } = data.results[0].geometry;

//                     const mapInstance = L.map("map", { scrollWheelZoom: false }).setView([lat, lng], 13);
//                     L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
//                         maxZoom: 19,
//                     }).addTo(mapInstance);

//                     const customIcon = L.icon({
//                         iconUrl: "http://localhost:4000/uploads/mui_ten.png",
//                         iconSize: [32, 32],
//                         iconAnchor: [16, 32],
//                         popupAnchor: [0, -32],
//                     });

//                     const newMarker = L.marker([lat, lng], { icon: customIcon }).addTo(mapInstance)
//                         .bindPopup("Địa điểm mặc định")
//                         .openPopup();

//                     setMap(mapInstance);
//                     setMarker(newMarker);
//                 } else {
//                     alert("Không tìm thấy tọa độ cho địa chỉ này.");
//                 }
//             } catch (error) {
//                 console.error("Lỗi khi lấy tọa độ từ địa chỉ:", error);
//             }
//         };

//         getCoordinatesFromAddress("149 Nguyễn Đệ, phường An Hòa, quận Ninh Kiều, Cần Thơ");

//         return () => {
//             if (map) {
//                 map.remove();
//             }
//         };
//     }, [navigate, map]);

//     const getAddressSuggestions = async (value) => {
//         try {
//             const response = await axios.get(
//                 `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(value)}&key=${API_KEY}&countrycode=VN`
//             );
//             const data = response.data;

//             if (data.results) {
//                 setSuggestions(data.results.map(result => result.formatted));
//             }
//         } catch (error) {
//             console.error("Lỗi khi lấy gợi ý địa chỉ:", error);
//         }
//     };

//     const handleSuggestionSelected = async (event, { suggestion }) => {
//         setOrderInfo((prev) => ({ ...prev, diachinhanhang: suggestion }));
//         await calculateShippingFee(suggestion);
//     };

//     const calculateShippingFee = async (address) => {
//         try {
//             const parts = address.split(",").map((part) => part.trim());
//             let found = false;

//             for (let i = 0; i < parts.length; i++) {
//                 const partialAddress = parts.slice(i).join(", ");
//                 const response = await axios.get(
//                     `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(partialAddress)}&key=${API_KEY}&countrycode=VN`
//                 );

//                 const data = response.data;
//                 if (data.results && data.results.length > 0) {
//                     const { lat, lng } = data.results[0].geometry;

//                     if (marker) {
//                         marker.setLatLng([lat, lng]).bindPopup(address).openPopup();
//                     } else if (map) {
//                         const customIcon = L.icon({
//                             iconUrl: "http://localhost:4000/uploads/mui_ten.png",
//                             iconSize: [32, 32],
//                             iconAnchor: [16, 32],
//                             popupAnchor: [0, -32],
//                         });

//                         const newMarker = L.marker([lat, lng], { icon: customIcon })
//                             .addTo(map)
//                             .bindPopup(address)
//                             .openPopup();

//                         setMarker(newMarker);
//                     }

//                     const warehouse = { lat: 10.028141, lng: 105.769229 };
//                     const distance = calculateDistance(
//                         warehouse.lat,
//                         warehouse.lng,
//                         lat,
//                         lng
//                     );

//                     setShippingFee(distance <= 5 ? 0 : distance * 500);
//                     found = true;
//                     break;
//                 }
//             }

//             if (!found) {
//                 alert("Không tìm thấy tọa độ cho địa chỉ này. Vui lòng kiểm tra lại.");
//             }
//         } catch (error) {
//             console.error("Lỗi khi gọi OpenCage API:", error);
//         }
//     };

//     const calculateDistance = (lat1, lon1, lat2, lon2) => {
//         const R = 6371;
//         const dLat = ((lat2 - lat1) * Math.PI) / 180;
//         const dLon = ((lon2 - lon1) * Math.PI) / 180;
//         const a =
//             Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//             Math.cos((lat1 * Math.PI) / 180) *
//                 Math.cos((lat2 * Math.PI) / 180) *
//                 Math.sin(dLon / 2) *
//                 Math.sin(dLon / 2);
//         const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//         return R * c;
//     };

//     const handlePlaceOrder = async () => {
//         if (!orderInfo.diachinhanhang) {
//             alert("Vui lòng nhập địa chỉ nhận hàng.");
//             return;
//         }

//         try {
//             const orderData = {
//                 ...orderInfo,
//                 tonggia: Math.round(getTotalPrice() + shippingFee), // Đảm bảo tổng giá là số nguyên
//                 chitietdonhang: cart.map((item) => ({
//                     masach: item.masach,
//                     gia: Math.round(item.gia), // Đảm bảo giá là số nguyên
//                     soluong: item.quantity,
//                 })),
//                 phuongthucthanhtoan: paymentMethod === "cod" ? "COD" : "VNPay",
//             };

//             console.log("orderData:", orderData); // Log để kiểm tra dữ liệu gửi đi

//             if (paymentMethod === "cod") {
//                 // Thanh toán khi nhận hàng
//                 const response = await axios.post("http://localhost:4000/api/orders", orderData);
//                 if (response.status === 200) {
//                     alert("Đặt hàng thành công!");
//                     clearCart();
//                     navigate("/cart");
//                 } else {
//                     alert(`Đặt hàng thất bại: ${response.data.message}`);
//                 }
//             } else if (paymentMethod === "online") {
//                 // Thanh toán online qua VNPay
//                 const response = await axios.post("http://localhost:4000/api/orders", orderData);
//                 if (response.status === 200) {
//                     const madh = response.data.madh;
//                     const amount = Math.round(orderData.tonggia); // Đảm bảo amount là số nguyên
//                     console.log("madh:", madh, "amount:", amount); // Log để kiểm tra
//                     const paymentUrl = await createVNPayPayment(madh, amount);
//                     window.location.href = paymentUrl;
//                 } else {
//                     alert(`Đặt hàng thất bại: ${response.data.message}`);
//                 }
//             }
//         } catch (error) {
//             console.error("Lỗi đặt hàng:", error);
//             alert("Đã xảy ra lỗi, vui lòng thử lại sau.");
//         }
//     };

//     const createVNPayPayment = async (madh, amount) => {
//         try {
//             // Đảm bảo madh và amount là hợp lệ
//             if (!madh || isNaN(amount) || amount <= 0) {
//                 throw new Error("Dữ liệu không hợp lệ: madh hoặc amount không đúng.");
//             }

//             const response = await axios.post("http://localhost:4000/api/create-payment", {
//                 madh: String(madh), // Chuyển madh thành chuỗi
//                 amount: Number(amount), // Đảm bảo amount là số
//                 returnUrl: "http://localhost:4000/payment-return",
//             });

//             console.log("VNPay response:", response.data); // Log để kiểm tra response
//             return response.data.paymentUrl;
//         } catch (error) {
//             console.error("Lỗi khi tạo URL thanh toán VNPay:", error);
//             alert("Không thể tạo URL thanh toán, vui lòng thử lại sau.");
//             throw error;
//         }
//     };

//     const handleInputBlur = async () => {
//         if (orderInfo.diachinhanhang.trim() !== "") {
//             await calculateShippingFee(orderInfo.diachinhanhang.trim());
//         }
//     };

//     const inputProps = {
//         placeholder: "Nhập địa chỉ nhận hàng",
//         value: orderInfo.diachinhanhang,
//         onChange: (e, { newValue }) => {
//             setOrderInfo((prev) => ({ ...prev, diachinhanhang: newValue }));
//             if (newValue.trim() === "") {
//                 setShippingFee(0);
//             }
//         },
//         onBlur: handleInputBlur,
//         onKeyPress: (e) => {
//             if (e.key === "Enter") {
//                 handleInputBlur();
//             }
//         },
//     };

//     return (
//         <div className="container my-5">
//             <h2 className="text-center mb-4">Thông Tin Đặt Hàng</h2>

//             <div className="row flex-column">
//                 <div className="card p-4 shadow-sm mb-4">
//                     <label htmlFor="diachinhanhang" className="form-label">Địa chỉ nhận hàng:</label>
//                     <Autosuggest
//                         suggestions={suggestions}
//                         onSuggestionsFetchRequested={({ value }) => getAddressSuggestions(value)}
//                         onSuggestionSelected={handleSuggestionSelected}
//                         getSuggestionValue={(suggestion) => suggestion}
//                         renderSuggestion={(suggestion) => <div>{suggestion}</div>}
//                         inputProps={inputProps}
//                     />
//                 </div>

//                 <div className="card p-4 shadow-sm mb-4">
//                     <div id="map" style={{ height: "300px", width: "100%" }}></div>
//                 </div>

//                 <div className="card p-4 shadow-sm mb-4">
//                     <h5 className="mb-3">Thông Tin Sản Phẩm</h5>
//                     <table className="table table-bordered">
//                         <thead>
//                             <tr>
//                                 <th className="text-center">STT</th>
//                                 <th className="text-center">Hình ảnh</th>
//                                 <th className="text-center">Tên sản phẩm</th>
//                                 <th className="text-center">Số lượng</th>
//                                 <th className="text-center">Giá tiền</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {cart.map((item, index) => (
//                                 <tr key={item.masach}>
//                                     <td className="text-center">{index + 1}</td>
//                                     <td className="text-center">
//                                         <img
//                                             src={`http://localhost:4000/uploads/${item.hinhanh}`}
//                                             alt={item.tenSP}
//                                             className="img-fluid"
//                                             style={{ maxWidth: '50px' }}
//                                         />
//                                     </td>
//                                     <td className="text-center">{item.tenSP}</td>
//                                     <td className="text-center">{item.quantity}</td>
//                                     <td className="text-center">{formatPrice(item.gia * item.quantity)}</td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>

//                 <div className="card p-4 shadow-sm mb-4">
//                     <div className="d-flex justify-content-between align-items-center mb-3">
//                         <h5>Phương thức thanh toán:</h5>
//                         <div>
//                             <label className="me-3">
//                                 <input
//                                     type="radio"
//                                     value="cod"
//                                     checked={paymentMethod === "cod"}
//                                     onChange={(e) => setPaymentMethod(e.target.value)}
//                                 />
//                                 Thanh toán khi nhận hàng
//                             </label>
//                             <label>
//                                 <input
//                                     type="radio"
//                                     value="online"
//                                     checked={paymentMethod === "online"}
//                                     onChange={(e) => setPaymentMethod(e.target.value)}
//                                 />
//                                 Thanh toán online (VNPay)
//                             </label>
//                         </div>
//                     </div>
//                     <h5>Phí vận chuyển: <span className="text-primary">{formatPrice(shippingFee)}</span></h5>
//                     <h5>Tổng tiền: <span className="text-danger">{formatPrice(getTotalPrice() + shippingFee)}</span></h5>
//                 </div>

//                 <button className="btn btn-success w-100" onClick={handlePlaceOrder}>
//                     Xác Nhận Đặt Hàng
//                 </button>
//             </div>
//         </div>
//     );
// };

// export default Checkout;