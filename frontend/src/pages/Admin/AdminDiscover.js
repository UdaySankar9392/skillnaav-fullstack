import React, { useEffect, useState } from "react";
import { Form, Input, Button, message, Upload, Spin } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { ShowLoading, HideLoading } from "../../redux/rootSlice";
import axios from "axios";
import firebase from "firebase/compat/app";
import "firebase/compat/storage";
import {
  LoadingOutlined,
  UploadOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import ImageLazyLoad from "react-lazyload";

const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

const AdminDiscover = () => {
  const [form] = Form.useForm();
  const [discoverImgUrl, setDiscoverImgUrl] = useState("");
  const [compImageUrls, setCompImageUrls] = useState([]);
  const [uploading, setUploading] = useState(false);
  const dispatch = useDispatch();
  const { skillnaavData, loading } = useSelector((state) => state.root);

  useEffect(() => {
    if (
      skillnaavData &&
      skillnaavData.discover &&
      skillnaavData.discover.length > 0
    ) {
      const discover = skillnaavData.discover[0];
      setDiscoverImgUrl(discover.imgUrl || "");
      setCompImageUrls(discover.compImageUrls || []);
    }
  }, [skillnaavData]);

  const onFinish = async (values) => {
    try {
      dispatch(ShowLoading());
      const response = await axios.put(
        `/api/skillnaav/update-discover/${skillnaavData.discover[0]._id}`,
        {
          ...values,
          imgUrl: discoverImgUrl,
          compImageUrls: compImageUrls,
        }
      );
      dispatch(HideLoading());
      if (response.data.success) {
        message.success("Changes saved successfully");
      } else {
        message.error(response.data.message || "Failed to save changes");
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error("Failed to save changes. Please try again later.");
      console.error("Error:", error);
    }
  };

  const handleDiscoverImageUpload = ({ file }) => {
    const storageRef = firebase.storage().ref();
    const fileRef = storageRef.child(`discover/${Date.now()}_${file.name}`);

    setUploading(true);

    fileRef
      .put(file)
      .then((snapshot) => {
        snapshot.ref.getDownloadURL().then((downloadURL) => {
          setDiscoverImgUrl(downloadURL);
          dispatch({
            type: "UPDATE_DISCOVER_IMG_URL",
            payload: downloadURL,
          });
          message.success("Discover image uploaded successfully");
        });
      })
      .catch((error) => {
        console.error("Discover image upload error:", error);
        message.error("Failed to upload discover image");
      })
      .finally(() => setUploading(false));
  };

  const handleCompanyImageUpload = async ({ file }) => {
    if (compImageUrls.length >= 5) {
      message.warning("You can upload a maximum of 5 images.");
      return;
    }

    const storageRef = firebase.storage().ref();
    const fileRef = storageRef.child(`company/${Date.now()}_${file.name}`);

    setUploading(true);

    try {
      const snapshot = await fileRef.put(file);
      const downloadURL = await snapshot.ref.getDownloadURL();

      setCompImageUrls([...compImageUrls, downloadURL]);
      dispatch({
        type: "UPDATE_COMP_IMAGE_URLS",
        payload: [...compImageUrls, downloadURL],
      });

      await axios.post("/api/skillnaav/add-discover-comp-img", {
        imageUrl: downloadURL,
      });
      message.success("Company image uploaded successfully");
    } catch (error) {
      console.error("Company image upload error:", error);
      message.error("Failed to upload company image");
    } finally {
      setUploading(false);
    }
  };

  const handleImageRemove = async (urlToRemove) => {
    try {
      const response = await axios.delete(
        `/api/skillnaav/delete-discover-comp-img/${encodeURIComponent(
          urlToRemove
        )}`
      );
      if (response.data.success) {
        message.success("Company image deleted successfully");
        setCompImageUrls(compImageUrls.filter((url) => url !== urlToRemove));
      } else {
        message.error(
          response.data.message || "Failed to delete company image"
        );
      }
    } catch (error) {
      console.error("Company image delete error:", error);
      message.error("Failed to delete company image");
    }
  };

  if (
    !skillnaavData ||
    !skillnaavData.discover ||
    skillnaavData.discover.length === 0
  ) {
    return <Spin spinning={true} indicator={antIcon} />;
  }

  const discover = skillnaavData.discover[0];
  const discovercompimg = skillnaavData.discovercompimg || [];

  return (
    <div className="p-8 bg-gray-100 rounded-lg shadow-md max-w-3xl mx-auto my-12 font-roboto">
      <h1 className="text-2xl font-bold text-center mb-8 text-gray-700">
        Edit Discover Section
      </h1>
      <Form
        form={form}
        onFinish={onFinish}
        layout="vertical"
        initialValues={discover}
      >
        {/* Form items */}
        <Form.Item name="discoverheading" label="Discover Heading">
          <Input placeholder="Enter Discover Heading" />
        </Form.Item>
        <Form.Item name="discoversubheading" label="Discover Sub Heading">
          <Input.TextArea rows={4} placeholder="Enter Discover Sub Heading" />
        </Form.Item>
        <Form.Item name="tryforfreebtn" label="Try for Free Button">
          <Input placeholder="Enter Try for Free Button" />
        </Form.Item>
        <Form.Item
          name="image"
          label="Upload Discover Image"
          valuePropName="fileList"
          getValueFromEvent={(e) => (Array.isArray(e) ? e : e && e.fileList)}
        >
          {/* Discover Image Upload */}
          <Upload
            name="image"
            listType="picture-card"
            showUploadList={false}
            beforeUpload={() => false}
            onChange={handleDiscoverImageUpload}
          >
            {discoverImgUrl ? (
              <img
                src={discoverImgUrl}
                alt="Discover"
                className="w-full h-auto rounded-lg"
              />
            ) : (
              <div className="flex items-center justify-center border border-dashed border-gray-300 rounded-md cursor-pointer p-4">
                <UploadOutlined className="text-3xl text-blue-500" />
                <span className="ml-2 text-gray-500">
                  Upload Discover Image
                </span>
              </div>
            )}
          </Upload>
          {discoverImgUrl && (
            <Button type="link" onClick={() => setDiscoverImgUrl("")}>
              Remove
            </Button>
          )}
          {/* Guidelines */}
          <p className="text-sm text-gray-500 mt-2">
            Please upload a high-quality image with recommended dimensions of
            1200x800 pixels.
          </p>
        </Form.Item>
        <Form.Item label="Company Images">
          {/* Company Image Upload */}
          <Upload
            name="image"
            listType="picture-card"
            showUploadList={false}
            beforeUpload={() => false}
            onChange={handleCompanyImageUpload}
          >
            <div className="flex items-center justify-center border border-dashed border-gray-300 rounded-md cursor-pointer p-4">
              <UploadOutlined className="text-3xl text-blue-500" />
              <span className="ml-2 text-gray-500">Upload Company Image</span>
            </div>
          </Upload>
          {/* Guidelines */}
          <p className="text-sm text-gray-500 mt-2">
            Please upload up to 5 high-quality images with recommended
            dimensions of 800x800 pixels.
          </p>
          {/* Uploaded Company Images */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            {compImageUrls.map((url, index) => (
              <div key={index} className="relative">
                <img
                  src={url}
                  alt={`Company Image ${index}`}
                  className="w-full h-auto rounded-lg"
                />
                <Button
                  type="link"
                  onClick={() => handleImageRemove(url)}
                  icon={<DeleteOutlined />}
                  className="absolute top-2 right-2 text-red-500"
                >
                  Delete
                </Button>
              </div>
            ))}
          </div>
        </Form.Item>
        {discovercompimg.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4 text-gray-700">
              Preview Company Images
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {discovercompimg.map((image, index) => (
                <div key={image._id} className="relative">
                  <img
                    src={image.imageUrl}
                    alt={`Company ${index + 1}`}
                    className="w-full h-auto rounded-lg"
                  />
                  <Button
                    type="link"
                    onClick={() => handleImageRemove(image._id)}
                    icon={<DeleteOutlined />}
                    className="absolute top-2 right-2 text-red-500"
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Save Changes Button */}
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Save Changes
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AdminDiscover;
