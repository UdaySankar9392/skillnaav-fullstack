import React, { useState, useEffect, useCallback } from "react";
import { Modal, Form, Input, Button, message, List, Skeleton } from "antd";
import axios from "axios";
import firebase from "firebase/compat/app";
import "firebase/compat/storage";

const { TextArea } = Input;

const AdminTeam = () => {
  const [skillnaavData, setSkillnaavData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditTeamModalVisible, setIsEditTeamModalVisible] = useState(false);
  const [isAddTeamModalVisible, setIsAddTeamModalVisible] = useState(false);
  const [selectedTeamMember, setSelectedTeamMember] = useState(null);
  const [form] = Form.useForm();
  const [imgUrl, setImgUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    fetchSkillnaavData();
  }, []);

  const fetchSkillnaavData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/skillnaav/get-skillnaav-data");
      setSkillnaavData(response.data.teammember);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching SkillNaav data:", error);
      setLoading(false);
      message.error("Failed to fetch team members");
    }
  }, []);

  const handleFileUpload = (event) => {
    const selectedFile = event.target.files[0];

    if (selectedFile) {
      setUploading(true);

      const storageRef = firebase.storage().ref();
      const fileRef = storageRef.child(selectedFile.name);
      fileRef
        .put(selectedFile)
        .then((snapshot) => snapshot.ref.getDownloadURL())
        .then((url) => {
          setImgUrl(url);
          setPreviewUrl(url);
          setUploading(false);
        })
        .catch((error) => {
          console.error("Error uploading file:", error);
          setUploading(false);
          message.error("Failed to upload image");
        });
    }
  };

  const handleFormSubmit = async (values) => {
    const teamData = { ...values, image: imgUrl };
    try {
      const response = await axios.post(
        "/api/skillnaav/add-teammember",
        teamData
      );
      message.success(response.data.message);
      fetchSkillnaavData();
      setIsAddTeamModalVisible(false);
      form.resetFields();
      setImgUrl(null);
      setPreviewUrl("");
    } catch (error) {
      console.error("Error adding team member:", error);
      message.error("Failed to add team member");
    }
  };

  const handleEditFormSubmit = async (values) => {
    const teamData = { ...values, image: imgUrl || selectedTeamMember.image };
    try {
      const response = await axios.put(
        `/api/skillnaav/update-teammember/${selectedTeamMember._id}`,
        teamData
      );
      message.success(response.data.message);
      fetchSkillnaavData();
      setIsEditTeamModalVisible(false);
      form.resetFields();
      setImgUrl(null);
      setPreviewUrl("");
    } catch (error) {
      console.error("Error updating team member:", error);
      message.error("Failed to update team member");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/skillnaav/delete-teammember/${id}`);
      message.success("Team member deleted successfully");
      fetchSkillnaavData();
    } catch (error) {
      console.error("Error deleting team member:", error);
      message.error("Failed to delete team member");
    }
  };

  const openEditTeamModal = (teamMember) => {
    setSelectedTeamMember(teamMember);
    setPreviewUrl(teamMember.image);
    form.setFieldsValue({
      teammemberName: teamMember.teammemberName,
      teammemberDesgn: teamMember.teammemberDesgn,
      teammemberDesc: teamMember.teammemberDesc,
      teammemberLinkedin: teamMember.teammemberLinkedin,
    });
    setIsEditTeamModalVisible(true);
  };

  return (
    <div>
      <h1>Manage Team Members</h1>
      <Button
        type="primary"
        onClick={() => setIsAddTeamModalVisible(true)}
        style={{ marginBottom: "20px" }}
      >
        Add Team Member
      </Button>
      {loading ? (
        <Skeleton active />
      ) : skillnaavData.length > 0 ? (
        <List
          itemLayout="horizontal"
          dataSource={skillnaavData}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button type="link" onClick={() => openEditTeamModal(item)}>
                  Edit
                </Button>,
                <Button
                  type="link"
                  danger
                  onClick={() => handleDelete(item._id)}
                >
                  Delete
                </Button>,
              ]}
            >
              <List.Item.Meta
                avatar={
                  <img src={item.image} alt={item.teammemberName} width={50} />
                }
                title={item.teammemberName}
                description={
                  item.teammemberDesc.length > 120
                    ? item.teammemberDesc.substring(0, 120) + "..."
                    : item.teammemberDesc
                }
              />
            </List.Item>
          )}
        />
      ) : (
        <p>No team members found.</p>
      )}

      <Modal
        title="Add Team Member"
        visible={isAddTeamModalVisible}
        onCancel={() => setIsAddTeamModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleFormSubmit}>
          <Form.Item
            name="teammemberName"
            label="Name"
            rules={[
              { required: true, message: "Please enter name" },
              { max: 50, message: "Name should not exceed 50 characters" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="teammemberDesgn"
            label="Designation"
            rules={[
              { required: true, message: "Please enter designation" },
              {
                max: 50,
                message: "Designation should not exceed 50 characters",
              },
            ]}
          >
            <Input maxLength={50} />
          </Form.Item>
          <Form.Item
            name="teammemberDesc"
            label="Description"
            rules={[
              { required: true, message: "Please enter description" },
              {
                max: 120,
                message: "Description should not exceed 120 characters",
              },
            ]}
          >
            <TextArea rows={4} maxLength={120} />
          </Form.Item>
          <Form.Item
            name="teammemberLinkedin"
            label="LinkedIn"
            rules={[
              { required: true, message: "Please enter LinkedIn URL" },
              {
                max: 100,
                message: "LinkedIn URL should not exceed 100 characters",
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Image">
            <input type="file" onChange={handleFileUpload} />
            {uploading && <p>Uploading...</p>}
            {previewUrl && <img src={previewUrl} alt="Preview" width={100} />}
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Add
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Edit Team Member"
        visible={isEditTeamModalVisible}
        onCancel={() => setIsEditTeamModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleEditFormSubmit}>
          <Form.Item
            name="teammemberName"
            label="Name"
            rules={[{ required: true, message: "Please enter name" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="teammemberDesgn"
            label="Designation"
            rules={[{ required: true, message: "Please enter designation" }]}
          >
            <Input maxLength={50} />
          </Form.Item>
          <Form.Item
            name="teammemberDesc"
            label="Description"
            rules={[{ required: true, message: "Please enter description" }]}
          >
            <TextArea rows={4} maxLength={120} />
          </Form.Item>
          <Form.Item
            name="teammemberLinkedin"
            label="LinkedIn"
            rules={[{ required: true, message: "Please enter LinkedIn URL" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Image">
            <input type="file" onChange={handleFileUpload} />
            {uploading && <p>Uploading...</p>}
            {previewUrl && <img src={previewUrl} alt="Preview" width={100} />}
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Update
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminTeam;
