import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Button, message, List, Skeleton } from "antd";
import axios from "axios";

function AdminPricing() {
  const [pricingData, setPricingData] = useState(null);
  const [modalVisible, setModalVisible] = useState({
    editPricingCard: false,
    addPricingCard: false,
    editHeading: false,
  });
  const [selectedPricingCard, setSelectedPricingCard] = useState(null);
  const [editPricingCardForm] = Form.useForm();
  const [addPricingCardForm] = Form.useForm();
  const [editHeadingForm] = Form.useForm();

  useEffect(() => {
    fetchPricingData();
  }, []);

  const fetchPricingData = async () => {
    try {
      const response = await axios.get("/api/skillnaav/get-skillnaav-data");
      setPricingData(response.data); // Assuming response.data has pricing and pricingcard
    } catch (error) {
      console.error("Error fetching pricing data:", error);
      message.error("Error fetching pricing data");
    }
  };

  if (!pricingData) {
    return <Skeleton active />;
  }

  const { pricing, pricingcard } = pricingData;

  // Check if pricing array exists and has at least one item
  if (!pricing || pricing.length === 0) {
    return <div>No pricing data available.</div>;
  }

  const { priceheading } = pricing[0]; // Destructure priceheading after ensuring pricing[0] exists

  const handleEditPricingCard = (pricingCard) => {
    setSelectedPricingCard(pricingCard);
    editPricingCardForm.setFieldsValue(pricingCard);
    setModalVisible({ ...modalVisible, editPricingCard: true });
  };

  const onDelete = async (pricingCardId) => {
    try {
      const response = await axios.delete(
        `/api/skillnaav/delete-pricingcard/${pricingCardId}`
      );
      if (response.data.success) {
        message.success(response.data.message);
        fetchPricingData();
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      message.error("Error deleting pricing card:", error.message);
    }
  };

  const onFinishEdit = async (values) => {
    try {
      const response = await axios.put(
        `/api/skillnaav/update-pricingcard/${values._id}`,
        values
      );

      if (response.data.success) {
        message.success(response.data.message);
        setModalVisible({ ...modalVisible, editPricingCard: false });
        fetchPricingData();
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      message.error("Error updating pricing card:", error.message);
    }
  };

  const onFinishAdd = async (values) => {
    try {
      const response = await axios.post(
        "/api/skillnaav/add-pricingcard",
        values
      );
      if (response.data.success) {
        message.success(response.data.message);
        setModalVisible({ ...modalVisible, addPricingCard: false });
        fetchPricingData();
        addPricingCardForm.resetFields();
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      message.error("Error adding pricing card:", error.message);
    }
  };

  const onFinishEditHeading = async (values) => {
    try {
      const { _id } = pricing[0];
      const response = await axios.post("/api/skillnaav/update-priceheading", {
        _id,
        priceheading: values.priceheading,
      });
      if (response.data.success) {
        message.success(response.data.message);
        setModalVisible({ ...modalVisible, editHeading: false });
        fetchPricingData();
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      message.error("Error updating pricing heading:", error.message);
    }
  };

  return (
    <div>
      <div className="border p-4 rounded-lg mb-4">
        <h1 className="text-xl font-semibold">Pricing</h1>
        <hr className="my-2" />
        {pricing && (
          <>
            <p className="mb-4">
              <span className="font-semibold">Heading: </span>
              {priceheading}
            </p>
            <div className="flex justify-end mt-4">
              <Button
                type="primary"
                onClick={() =>
                  setModalVisible({ ...modalVisible, editHeading: true })
                }
              >
                Edit Heading
              </Button>
            </div>
          </>
        )}
      </div>

      <div className="border p-4 rounded-lg mb-4">
        <h1 className="text-xl font-semibold">Pricing Cards</h1>
        <hr className="my-2" />
        <List
          itemLayout="horizontal"
          dataSource={pricingcard}
          renderItem={(card) => (
            <List.Item
              actions={[
                <Button
                  type="link"
                  onClick={() => handleEditPricingCard(card)}
                  key="edit"
                >
                  Edit
                </Button>,
                <Button
                  type="link"
                  onClick={() => onDelete(card._id)}
                  key="delete"
                >
                  Delete
                </Button>,
              ]}
            >
              <List.Item.Meta
                title={
                  <span style={{ color: card.color }}>{card.plantype}</span>
                }
                description={
                  <span style={{ color: card.color }}>
                    {card.plantypesubhead}
                  </span>
                }
              />
            </List.Item>
          )}
        />

        <Button
          type="primary"
          className="mt-4"
          onClick={() =>
            setModalVisible({ ...modalVisible, addPricingCard: true })
          }
        >
          Add Pricing Card
        </Button>
      </div>

      <Modal
        title="Edit Pricing Card"
        visible={modalVisible.editPricingCard}
        onCancel={() =>
          setModalVisible({ ...modalVisible, editPricingCard: false })
        }
        footer={null}
      >
        <Form form={editPricingCardForm} onFinish={onFinishEdit}>
          <Form.Item name="_id" hidden={true}>
            <Input />
          </Form.Item>
          <Form.Item name="plantype" label="Plan Type">
            <Input />
          </Form.Item>
          <Form.Item name="plantypesubhead" label="Sub Heading">
            <Input />
          </Form.Item>
          <Form.Item name="price" label="Price">
            <Input />
          </Form.Item>
          <Form.Item name="pricepoint1" label="Price Point 1">
            <Input />
          </Form.Item>
          <Form.Item name="pricepoint2" label="Price Point 2">
            <Input />
          </Form.Item>
          <Form.Item name="pricepoint3" label="Price Point 3">
            <Input />
          </Form.Item>
          <Form.Item name="pricebtn" label="Button Text">
            <Input />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Update
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Add Pricing Card"
        visible={modalVisible.addPricingCard}
        onCancel={() =>
          setModalVisible({ ...modalVisible, addPricingCard: false })
        }
        footer={null}
      >
        <Form form={addPricingCardForm} onFinish={onFinishAdd}>
          <Form.Item name="plantype" label="Plan Type">
            <Input />
          </Form.Item>
          <Form.Item name="plantypesubhead" label="Sub Heading">
            <Input />
          </Form.Item>
          <Form.Item name="price" label="Price">
            <Input />
          </Form.Item>
          <Form.Item name="pricepoint1" label="Price Point 1">
            <Input />
          </Form.Item>
          <Form.Item name="pricepoint2" label="Price Point 2">
            <Input />
          </Form.Item>
          <Form.Item name="pricepoint3" label="Price Point 3">
            <Input />
          </Form.Item>
          <Form.Item name="pricebtn" label="Button Text">
            <Input />
          </Form.Item>
          <Form.Item name="bgcolor" label="Background Color">
            <Input />
          </Form.Item>
          <Form.Item name="color" label="Text Color">
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Add
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Edit Pricing Heading"
        visible={modalVisible.editHeading}
        onCancel={() =>
          setModalVisible({ ...modalVisible, editHeading: false })
        }
        footer={null}
      >
        <Form form={editHeadingForm} onFinish={onFinishEditHeading}>
          <Form.Item
            name="priceheading"
            label="Pricing Heading"
            initialValue={priceheading}
          >
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Update Heading
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default AdminPricing;
