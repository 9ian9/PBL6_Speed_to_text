const User = require('../models/User');
const bcrypt = require('bcrypt');

exports.login = async(req, res) => {
    const { username, password } = req.body;
    
    try {
        const user = await User.findOne({ where: { username } });
        if (user) {
            // So sánh trực tiếp mật khẩu nhập vào với mật khẩu trong cơ sở dữ liệu
            if (password === user.password) {
                res.render('home', { title: 'Home', username: user.username });
                //res.send('Login successful');
            } else {
                res.send('Invalid username or password');
            }
        } else {
            res.send('User not found');
        }
    } catch (error) {
        console.log(error); // In ra lỗi để kiểm tra
        res.status(500).send('Server error');
    }
};

exports.getLoginPage = (req, res) => {
    res.render('login', { title: 'Login' });
};

exports.register = async (req, res) => {
    const { email, username, password, confirmPassword } = req.body;

    // Kiểm tra các trường không được để trống
    if (!email || !username || !password || !confirmPassword) {
        return res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin!" });
    }

    // Kiểm tra tính hợp lệ của email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Email không hợp lệ!" });
    }

    // Kiểm tra mật khẩu và xác nhận mật khẩu
    if (password !== confirmPassword) {
        return res.status(400).json({ message: "Mật khẩu không khớp!" });
    }

    try {
        // Kiểm tra xem email đã được sử dụng hay chưa
        const [rows] = await connection.promise().query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length > 0) {
            return res.status(400).json({ message: "Email đã được sử dụng!" });
        }

        // Mã hóa mật khẩu
        const bcrypt = require('bcrypt');
        const hashedPassword = await bcrypt.hash(password, 10);

        // Lưu người dùng mới vào cơ sở dữ liệu
        await connection.promise().query(
            'INSERT INTO users (email, username, password) VALUES (?, ?, ?)',
            [email, username, hashedPassword]
        );

        // Trả về phản hồi thành công
        res.status(201).json({ message: "Đăng ký thành công!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Đã xảy ra lỗi, vui lòng thử lại sau!" });
    }
};
exports.getRegisterPage = (req, res) => {
    res.render('register', { title: 'Đăng ký tài khoản' });
};

