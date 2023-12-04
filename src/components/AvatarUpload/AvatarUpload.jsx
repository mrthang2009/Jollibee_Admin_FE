import { useState } from "react";
import { message, Upload, Button, Row } from "antd";
import { PlusOutlined, LoadingOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";
import axios from 'axios';

const getBase64 = (img, callback) => {
  const reader = new FileReader();
  reader.addEventListener("load", () => callback(reader.result));
  reader.readAsDataURL(img);
};

const beforeUpload = (file) => {
  const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
  if (!isJpgOrPng) {
    message.error("Bạn chỉ có thể tải lên tệp JPG/PNG!");
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error("Hình ảnh phải nhỏ hơn 2MB!");
  }
  return isJpgOrPng && isLt2M;
  
};
const AvatarUpload = ({ handleCancel }) => {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState();
  const [file, setFile] = useState(null); // Thêm biến state để lưu trữ đối tượng file

  const handleChange = (info) => {
    if (info.file.status === "uploading") {
      setLoading(true);
      return;
    }
    if (info.file.status === "done") {
      getBase64(info.file.originFileObj, (url) => {
        setImageUrl(url);
        setLoading(false);
        setFile(info.file); // Lưu trữ đối tượng file vào state
      });
    }
  };

  const handleSave = async () => {
    try {
      if (!imageUrl || !file) {
        message.error("Chưa có ảnh để lưu.");
        return;
      }

      console.log("««««« file »»»»»", file);

      // Tạo đối tượng FormData và thêm dữ liệu vào đó
      const formData = new FormData();
      formData.append("avatar", file);
      console.log("««««« formData »»»»»", formData);

      // Thực hiện yêu cầu POST đến API
      const postResponse = await axios.post(
        "http://localhost:9000/medias/upload-avatar-me",
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      if (postResponse.status === 200) {
        message.success("Lưu ảnh đại diện thành công");
      } else {
        const errorData = postResponse.data;
        message.error(`Lưu ảnh đại diện thất bại: ${errorData.message}`);
      }
    } catch (error) {
      // Xử lý lỗi nếu có lỗi trong quá trình gọi API
      message.error("Có lỗi xảy ra khi gọi API");
    }
  };

  const uploadButton = (
    <div>
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div
        style={{
          marginTop: 8,
        }}
      >
        Chọn ảnh
      </div>
    </div>
  );

  return (
    <>
      <Upload
        name="avatar"
        listType="picture-circle"
        className="avatar-uploader"
        showUploadList={false}
        // action="http://localhost:9000/medias/upload-avatar-me"
        action="https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188"
        beforeUpload={beforeUpload}
        onChange={handleChange}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="avatar"
            style={{
              width: "100%",
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />
        ) : (
          uploadButton
        )}
      </Upload>
      <Row justify="end">
        <Button onClick={handleCancel}>Hủy</Button>
        <Button
          type="primary"
          htmlType="button"
          style={{ marginLeft: "10px" }}
          onClick={handleSave} // Gọi handleSave khi nút "Lưu" được nhấn
        >
          Lưu
        </Button>
      </Row>
    </>
  );
};

AvatarUpload.propTypes = {
  handleCancel: PropTypes.func,
};

export default AvatarUpload;
