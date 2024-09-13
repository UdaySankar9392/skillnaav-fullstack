// src/components/AdminVision.js
import React, { useState, useEffect, useCallback } from "react";
import { Modal, Form, Input, Button, message, List, Skeleton } from "antd";
import axios from "axios";
import firebase from "firebase/compat/app";
import "firebase/compat/storage";

const { TextArea } = Input;

const AdminVision = () => {
  const [skillnaavData, setSkillnaavData] = useState(null);
  const [modalData, setModalData] = useState({
    isVisible: false,
    type: "",
    data: null,
  });
  const [form] = Form.useForm();
  const [imgUrl, setImgUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchSkillnaavData();
  }, []);

  const handleFileUpload = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      // Set uploading state to true to show loader
      setUploading(true);

      // Set the preview URL for instant feedback
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(selectedFile);

      // Upload to Firebase
      const storageRef = firebase.storage().ref();
      const fileRef = storageRef.child(selectedFile.name);
      fileRef
        .put(selectedFile)
        .then((snapshot) => {
          return snapshot.ref.getDownloadURL();
        })
        .then((downloadURL) => {
          console.log(downloadURL);
          setImgUrl(downloadURL);
          setUploading(false); // Set uploading state to false after successful upload
        })
        .catch((error) => {
          console.error("Error uploading file:", error);
          setUploading(false); // Set uploading state to false on error
          // Handle error as needed (e.g., show error message)
        });
    } else {
      console.log("No file selected, so select one");
    }
  };

  const fetchSkillnaavData = useCallback(async () => {
    try {
      const response = await axios.get("/api/skillnaav/get-skillnaav-data");
      setSkillnaavData(response.data);
      if (response.data.visionhead && response.data.visionhead.length > 0) {
        setImgUrl(response.data.visionhead[0].visionImg || "");
        setPreviewUrl(response.data.visionhead[0].visionImg || "");
      }
    } catch (error) {
      console.error("Error fetching skillnaav data:", error);
    }
  }, []);

  const handleFinish = useCallback(
    async (values) => {
      try {
        let response;
        if (modalData.type === "editHead") {
          const { _id } = modalData.data;
          response = await axios.put(
            `/api/skillnaav/update-visionhead/${_id}`,
            {
              ...values,
              visionImg: imgUrl, // Include uploaded image URL in update
            }
          );
        } else if (modalData.type === "editPoint") {
          const { _id } = modalData.data;
          values._id = _id;
          response = await axios.put(
            `/api/skillnaav/update-visionpoint/${_id}`,
            values
          );
        } else if (modalData.type === "addPoint") {
          response = await axios.post("/api/skillnaav/add-visionpoint", {
            ...values,
            visionImg: imgUrl, // Include uploaded image URL in creation
          });
        }

        if (response.data.success) {
          message.success(response.data.message);
          setModalData({ isVisible: false, type: "", data: null });
          fetchSkillnaavData();
          form.resetFields();
          setPreviewUrl("");
        } else {
          message.error(response.data.message);
        }
      } catch (error) {
        message.error(`Error ${modalData.type} vision data: ${error.message}`);
      }
    },
    [modalData, form, fetchSkillnaavData, imgUrl]
  );

  const handleDelete = useCallback(
    async (visionpointId) => {
      try {
        const response = await axios.delete(
          `/api/skillnaav/delete-visionpoint/${visionpointId}`
        );
        if (response.data.success) {
          message.success(response.data.message);
          fetchSkillnaavData();
        } else {
          message.error(response.data.message);
        }
      } catch (error) {
        message.error(`Error deleting vision point: ${error.message}`);
      }
    },
    [fetchSkillnaavData]
  );

  const openModal = useCallback(
    (type, data = null) => {
      setModalData({ isVisible: true, type, data });
      if (data) {
        form.setFieldsValue(data);
        setImgUrl(data.visionImg || "");
        setPreviewUrl(data.visionImg || "");
      }
    },
    [form]
  );

  if (!skillnaavData) {
    return (
      <div className="flex justify-center items-center h-full">
        <Skeleton active avatar />
      </div>
    );
  }

  const { visionhead, visionpoint } = skillnaavData;

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <div className="border p-4 rounded-lg bg-white shadow-md">
          <h1 className="text-2xl font-semibold mb-4">Vision Head</h1>
          <div className="mb-4">
            <p className="text-lg mb-2 font-semibold">Heading:</p>
            <p className="mb-2">{visionhead[0]?.visionheading}</p>
          </div>
          <div className="mb-4">
            <p className="text-lg mb-2 font-semibold">Sub Heading:</p>
            <p className="mb-2">{visionhead[0]?.visionsub}</p>
          </div>
          {imgUrl && (
            <div className="mb-4">
              <p className="text-lg mb-2 font-semibold">Image:</p>
              <img
                src={imgUrl}
                alt="Vision Image"
                className="max-w-full h-auto rounded"
                style={{ maxHeight: "400px", objectFit: "cover" }}
              />
            </div>
          )}
          <div className="flex justify-end">
            <Button
              type="primary"
              onClick={() => openModal("editHead", visionhead[0])}
            >
              Edit Vision Head
            </Button>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <div className="border p-4 rounded-lg bg-white shadow-md">
          <h1 className="text-2xl font-semibold mb-4">Vision Points</h1>
          <List
            itemLayout="horizontal"
            dataSource={visionpoint}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button
                    type="link"
                    onClick={() => openModal("editPoint", item)}
                    className="text-blue-500"
                  >
                    Edit
                  </Button>,
                  <Button
                    type="link"
                    onClick={() => handleDelete(item._id)}
                    className="text-red-500"
                  >
                    Delete
                  </Button>,
                ]}
              >
                <List.Item.Meta title={item.visionpoint} />
              </List.Item>
            )}
          />
          <div className="flex justify-end mt-4">
            <Button
              type="primary"
              onClick={() => openModal("addPoint")}
              className="bg-green-500 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              Add Vision Point
            </Button>
          </div>
        </div>
      </div>

      {/* Edit/Add Vision Modal */}
      <Modal
        visible={modalData.isVisible}
        title={
          modalData.type === "editHead"
            ? "Edit Vision Head"
            : modalData.type === "editPoint"
            ? "Edit Vision Point"
            : "Add Vision Point"
        }
        onCancel={() =>
          setModalData({ isVisible: false, type: "", data: null })
        }
        footer={null}
      >
        <Form layout="vertical" onFinish={handleFinish} form={form}>
          {modalData.type === "editHead" ? (
            <>
              <Form.Item
                name="visionheading"
                label="Vision Heading"
                rules={[
                  { required: true, message: "Please enter vision heading" },
                ]}
              >
                <TextArea rows={4} />
              </Form.Item>
              <Form.Item
                name="visionsub"
                label="Vision Sub Heading"
                rules={[
                  {
                    required: true,
                    message: "Please enter vision sub heading",
                  },
                ]}
              >
                <TextArea rows={4} />
              </Form.Item>
              <Form.Item
                name="visionImg"
                label="Vision Image"
                rules={[
                  { required: true, message: "Please upload vision image" },
                ]}
              >
                <input type="file" onChange={handleFileUpload} />
                {uploading ? (
                  <div className="mt-2 flex items-center">
                    <Skeleton.Avatar active size="small" />
                    <Skeleton.Button
                      active
                      style={{ marginLeft: 10, width: 150 }}
                    />
                  </div>
                ) : previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Vision Image"
                    className="max-w-full h-auto rounded mt-2"
                    style={{ maxHeight: "200px", objectFit: "cover" }}
                  />
                ) : null}
              </Form.Item>
            </>
          ) : (
            <Form.Item
              name="visionpoint"
              label="Vision Point"
              rules={[{ required: true, message: "Please enter vision point" }]}
            >
              <TextArea rows={4} />
            </Form.Item>
          )}
          <div className="flex justify-end">
            <Button type="primary" htmlType="submit">
              {modalData.type === "addPoint" ? "Add" : "Save"}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default React.memo(AdminVision);
