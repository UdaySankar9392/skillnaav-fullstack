import React, { useState, useEffect, useCallback } from "react";
import { Modal, Form, Input, Button, message, Skeleton } from "antd";
import axios from "axios";
import firebase from "firebase/compat/app";
import "firebase/compat/storage";

const { TextArea } = Input;

function AdminFeatures() {
  const [skillnaavData, setSkillnaavData] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState("");
  const [previewImageUrl, setPreviewImageUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false); // State to manage image upload loading

  useEffect(() => {
    fetchSkillnaavData();
  }, []);

  const fetchSkillnaavData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/skillnaav/get-skillnaav-data");
      setSkillnaavData(response.data);
    } catch (error) {
      message.error("Failed to fetch data. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleFileUpload = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setUploadingImage(true); // Set uploading image state to true
      const storageRef = firebase.storage().ref();
      const fileRef = storageRef.child(selectedFile.name);

      fileRef.put(selectedFile).then((snapshot) => {
        snapshot.ref.getDownloadURL().then((downloadURL) => {
          setImageUrl(downloadURL);
          setPreviewImageUrl(downloadURL);
          setUploadingImage(false); // Set uploading image state to false after upload completes
        });
      });
    }
  };

  const onFinishEdit = async (values) => {
    try {
      setLoading(true);
      const payload = {
        ...values,
        featureImg: imageUrl,
      };
      const response = await axios.put(
        `/api/skillnaav/update-feature/${selectedFeature._id}`,
        payload
      );
      if (response.data.success) {
        message.success(response.data.message);
        setShowEditModal(false);
        fetchSkillnaavData();
        form.resetFields();
        setImageUrl("");
        setPreviewImageUrl(""); // Clear preview image after successful update
      } else {
        message.error(response.data.message || "Failed to update feature.");
      }
    } catch (error) {
      message.error(
        "Error updating feature: " +
          (error.message || "Unknown error occurred.")
      );
    } finally {
      setLoading(false);
    }
  };

  const onFinishAdd = async (values) => {
    try {
      setLoading(true);
      const payload = { ...values, featureImg: imageUrl };
      const response = await axios.post("/api/skillnaav/add-feature", payload);
      if (response.data.success) {
        message.success(response.data.message);
        setShowAddModal(false);
        fetchSkillnaavData();
        form.resetFields();
        setImageUrl("");
        setPreviewImageUrl(""); // Clear preview image after successful addition
      } else {
        message.error(response.data.message || "Failed to add feature.");
      }
    } catch (error) {
      message.error(
        "Error adding feature: " + (error.message || "Unknown error occurred.")
      );
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (featureId) => {
    try {
      setLoading(true);
      const response = await axios.delete(
        `/api/skillnaav/delete-feature/${featureId}`
      );
      if (response.data.success) {
        message.success(response.data.message);
        fetchSkillnaavData();
      } else {
        message.error(response.data.message || "Failed to delete feature.");
      }
    } catch (error) {
      message.error(
        "Error deleting feature: " +
          (error.message || "Unknown error occurred.")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (feature) => {
    setSelectedFeature(feature);
    setImageUrl(feature.featureImg);
    setPreviewImageUrl(feature.featureImg);
    form.setFieldsValue(feature);
    setShowEditModal(true);
  };

  const handleAdd = () => {
    form.resetFields();
    setSelectedFeature(null);
    setImageUrl("");
    setPreviewImageUrl("");
    setShowAddModal(true);
  };

  if (loading || !skillnaavData || !skillnaavData.features) {
    return <Skeleton active avatar />;
  }

  const { features } = skillnaavData;

  return (
    <div>
      <div style={{ marginBottom: "16px" }}>
        <Button
          type="primary"
          onClick={handleAdd}
          style={{ backgroundColor: "#1890ff", color: "#FFFFFF" }}
        >
          Add Feature
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-1 gap-4">
        {features.map((feat, index) => (
          <div className="border p-4 rounded-lg" key={index}>
            <h1 className="text-xl font-semibold" style={{ color: "#000000" }}>
              {feat.feature}
            </h1>
            <hr className="my-2" />
            <p className="mb-4" style={{ color: "#000000" }}>
              {feat.featuredesc}
            </p>
            <p className="mb-1" style={{ color: "#000000" }}>
              <span className="font-semibold">Sub Text: </span>
              {feat.subfeature}
            </p>
            <p className="mb-1" style={{ color: "#000000" }}>
              <span className="font-semibold">Point 1: </span>
              {feat.point1}
            </p>
            <p className="mb-1" style={{ color: "#000000" }}>
              <span className="font-semibold">Point 2: </span>
              {feat.point2}
            </p>
            <p className="mb-1" style={{ color: "#000000" }}>
              <span className="font-semibold">Point 3: </span>
              {feat.point3}
            </p>
            <p className="mb-1" style={{ color: "#000000" }}>
              <span className="font-semibold">Point 4: </span>
              {feat.point4}
            </p>
            {feat.featureImg && (
              <div className="mb-4">
                <img
                  src={feat.featureImg}
                  alt="Feature Image"
                  style={{ maxWidth: "100%", maxHeight: "200px" }}
                />
              </div>
            )}
            <div className="flex justify-end mt-4">
              <Button
                type="primary"
                onClick={() => handleEdit(feat)}
                className="mr-2"
                style={{ backgroundColor: "#1890ff", color: "#FFFFFF" }}
              >
                Edit
              </Button>
              <Button
                type="danger"
                onClick={() => onDelete(feat._id)}
                style={{ backgroundColor: "#f5222d", color: "#FFFFFF" }}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        visible={showEditModal}
        title="Edit Feature"
        onCancel={() => {
          setShowEditModal(false);
          form.resetFields();
          setImageUrl("");
          setPreviewImageUrl("");
        }}
        footer={null}
      >
        <Form layout="vertical" onFinish={onFinishEdit} form={form}>
          <Form.Item
            name="feature"
            label="Feature"
            rules={[{ required: true, message: "Please enter feature" }]}
          >
            <TextArea rows={2} />
          </Form.Item>
          <Form.Item
            name="featuredesc"
            label="Feature Description"
            rules={[
              { required: true, message: "Please enter feature description" },
            ]}
          >
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item
            name="subfeature"
            label="Sub Feature"
            rules={[{ required: true, message: "Please enter sub feature" }]}
          >
            <TextArea rows={2} />
          </Form.Item>
          <Form.Item
            name="point1"
            label="Point 1"
            rules={[{ required: true, message: "Please enter point 1" }]}
          >
            <TextArea rows={2} />
          </Form.Item>
          <Form.Item
            name="point2"
            label="Point 2"
            rules={[{ required: true, message: "Please enter point 2" }]}
          >
            <TextArea rows={2} />
          </Form.Item>
          <Form.Item
            name="point3"
            label="Point 3"
            rules={[{ required: true, message: "Please enter point 3" }]}
          >
            <TextArea rows={2} />
          </Form.Item>
          <Form.Item
            name="point4"
            label="Point 4"
            rules={[{ required: true, message: "Please enter point 4" }]}
          >
            <TextArea rows={2} />
          </Form.Item>
          <input type="file" onChange={handleFileUpload} />
          {uploadingImage ? (
            <div className="mt-2 flex items-center">
              <Skeleton.Avatar active size="small" />
              <Skeleton.Button active style={{ marginLeft: 10, width: 150 }} />
            </div>
          ) : previewImageUrl ? (
            <img
              src={previewImageUrl}
              alt="Preview"
              className="max-w-full h-auto rounded mt-2"
              style={{ maxHeight: "200px", objectFit: "cover" }}
            />
          ) : null}
          <Form.Item style={{ marginTop: "16px" }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{ backgroundColor: "#1890ff", color: "#FFFFFF" }}
            >
              Save Changes
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        visible={showAddModal}
        title="Add New Feature"
        onCancel={() => {
          setShowAddModal(false);
          form.resetFields();
          setImageUrl("");
          setPreviewImageUrl("");
        }}
        footer={null}
      >
        <Form layout="vertical" onFinish={onFinishAdd} form={form}>
          <Form.Item
            name="feature"
            label="Feature"
            rules={[{ required: true, message: "Please enter feature" }]}
          >
            <TextArea rows={2} />
          </Form.Item>
          <Form.Item
            name="featuredesc"
            label="Feature Description"
            rules={[
              { required: true, message: "Please enter feature description" },
            ]}
          >
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item
            name="subfeature"
            label="Sub Feature"
            rules={[{ required: true, message: "Please enter sub feature" }]}
          >
            <TextArea rows={2} />
          </Form.Item>
          <Form.Item
            name="point1"
            label="Point 1"
            rules={[{ required: true, message: "Please enter point 1" }]}
          >
            <TextArea rows={2} />
          </Form.Item>
          <Form.Item
            name="point2"
            label="Point 2"
            rules={[{ required: true, message: "Please enter point 2" }]}
          >
            <TextArea rows={2} />
          </Form.Item>
          <Form.Item
            name="point3"
            label="Point 3"
            rules={[{ required: true, message: "Please enter point 3" }]}
          >
            <TextArea rows={2} />
          </Form.Item>
          <Form.Item
            name="point4"
            label="Point 4"
            rules={[{ required: true, message: "Please enter point 4" }]}
          >
            <TextArea rows={2} />
          </Form.Item>
          <input type="file" onChange={handleFileUpload} />
          {uploadingImage && <Skeleton.Image style={{ width: "100%" }} />}
          {previewImageUrl && !uploadingImage && (
            <img
              src={previewImageUrl}
              alt="Preview"
              style={{ maxWidth: "100%", maxHeight: "200px" }}
            />
          )}
          <Form.Item style={{ marginTop: "16px" }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{ backgroundColor: "#1890ff", color: "#FFFFFF" }}
            >
              Add Feature
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default AdminFeatures;
