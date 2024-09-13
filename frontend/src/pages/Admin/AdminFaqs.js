import React, { useState, useEffect, useCallback } from "react";
import { Modal, Form, Input, Button, message, List, Skeleton } from "antd";
import axios from "axios";

function AdminFaqs() {
  const [faqData, setFaqData] = useState(null);
  const [modalVisible, setModalVisible] = useState({
    editFaqCard: false,
    addFaqCard: false,
    editHeading: false,
  });
  const [selectedFaqCard, setSelectedFaqCard] = useState(null);
  const [editFaqCardForm] = Form.useForm();
  const [addFaqCardForm] = Form.useForm();
  const [editHeadingForm] = Form.useForm();

  useEffect(() => {
    fetchFaqData();
  }, []);

  const fetchFaqData = useCallback(async () => {
    try {
      const response = await axios.get("/api/skillnaav/get-skillnaav-data");
      setFaqData(response.data);
    } catch (error) {
      console.error("Error fetching FAQ data:", error);
      message.error("Error fetching FAQ data");
    }
  }, []);

  const handleEditFaqCard = useCallback(
    (faqCard) => {
      setSelectedFaqCard(faqCard);
      editFaqCardForm.setFieldsValue(faqCard);
      setModalVisible((prevState) => ({
        ...prevState,
        editFaqCard: true,
      }));
    },
    [editFaqCardForm]
  );

  const onDelete = useCallback(
    async (faqCardId) => {
      try {
        const response = await axios.delete(
          `/api/skillnaav/delete-faqcard/${faqCardId}`
        );
        if (response.data.success) {
          message.success(response.data.message);
          fetchFaqData();
        } else {
          message.error(response.data.message);
        }
      } catch (error) {
        message.error("Error deleting FAQ card:", error.message);
      }
    },
    [fetchFaqData]
  );

  const onFinishEdit = useCallback(
    async (values) => {
      try {
        const response = await axios.put(
          `/api/skillnaav/update-faqcard/${values._id}`,
          values
        );
        if (response.data.success) {
          message.success(response.data.message);
          setModalVisible((prevState) => ({
            ...prevState,
            editFaqCard: false,
          }));
          fetchFaqData();
        } else {
          message.error(response.data.message);
        }
      } catch (error) {
        message.error("Error updating FAQ card:", error.message);
      }
    },
    [fetchFaqData]
  );

  const onFinishAdd = useCallback(
    async (values) => {
      try {
        const response = await axios.post("/api/skillnaav/add-faqcard", values);
        if (response.data.success) {
          message.success(response.data.message);
          setModalVisible((prevState) => ({
            ...prevState,
            addFaqCard: false,
          }));
          fetchFaqData();
          addFaqCardForm.resetFields();
        } else {
          message.error(response.data.message);
        }
      } catch (error) {
        message.error("Error adding FAQ card:", error.message);
      }
    },
    [fetchFaqData, addFaqCardForm]
  );

  const onFinishEditHeading = useCallback(
    async (values) => {
      try {
        const { _id } = faqData.faq[0];
        const response = await axios.post("/api/skillnaav/update-faqheading", {
          _id,
          faqheading: values.faqheading,
          faqsubheading: values.faqsubheading,
        });
        if (response.data.success) {
          message.success(response.data.message);
          setModalVisible((prevState) => ({
            ...prevState,
            editHeading: false,
          }));
          fetchFaqData();
        } else {
          message.error(response.data.message);
        }
      } catch (error) {
        message.error("Error updating FAQ heading:", error.message);
      }
    },
    [fetchFaqData, faqData]
  );

  if (!faqData) {
    return <Skeleton active />;
  }

  const { faq, faqcard } = faqData;
  const { faqheading, faqsubheading } = faq[0];

  return (
    <div>
      <div className="border p-4 rounded-lg mb-4">
        <h1 className="text-xl font-semibold">FAQs</h1>
        <hr className="my-2" />
        {faq && (
          <>
            <p className="mb-4">
              <span className="font-semibold">Heading: </span>
              {faqheading}
            </p>
            <div className="flex justify-end mt-4">
              <Button
                type="primary"
                onClick={() =>
                  setModalVisible((prevState) => ({
                    ...prevState,
                    editHeading: true,
                  }))
                }
              >
                Edit Heading
              </Button>
            </div>
          </>
        )}
      </div>
      <div className="border p-4 rounded-lg mb-4">
        <h1 className="text-xl font-semibold">FAQ Cards</h1>
        <hr className="my-2" />
        <List
          itemLayout="horizontal"
          dataSource={faqcard}
          renderItem={(card) => (
            <List.Item
              actions={[
                <Button
                  type="link"
                  onClick={() => handleEditFaqCard(card)}
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
              <List.Item.Meta title={card.faq} description={card.answer} />
            </List.Item>
          )}
        />
        <Button
          type="primary"
          className="mt-4"
          onClick={() =>
            setModalVisible((prevState) => ({
              ...prevState,
              addFaqCard: true,
            }))
          }
        >
          Add FAQ Card
        </Button>
      </div>
      <Modal
        title="Edit FAQ Card"
        visible={modalVisible.editFaqCard}
        onCancel={() =>
          setModalVisible((prevState) => ({
            ...prevState,
            editFaqCard: false,
          }))
        }
        footer={null}
      >
        <Form form={editFaqCardForm} onFinish={onFinishEdit}>
          <Form.Item name="_id" hidden={true}>
            <Input />
          </Form.Item>
          <Form.Item name="faq" label="FAQ Heading">
            <Input />
          </Form.Item>
          <Form.Item name="answer" label="FAQ Subheading">
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
        title="Add FAQ Card"
        visible={modalVisible.addFaqCard}
        onCancel={() =>
          setModalVisible((prevState) => ({
            ...prevState,
            addFaqCard: false,
          }))
        }
        footer={null}
      >
        <Form form={addFaqCardForm} onFinish={onFinishAdd}>
          <Form.Item name="faq" label="FAQ Heading">
            <Input />
          </Form.Item>
          <Form.Item name="answer" label="FAQ Subheading">
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
        title="Edit FAQ Heading"
        visible={modalVisible.editHeading}
        onCancel={() =>
          setModalVisible((prevState) => ({
            ...prevState,
            editHeading: false,
          }))
        }
        footer={null}
      >
        <Form form={editHeadingForm} onFinish={onFinishEditHeading}>
          <Form.Item
            name="faqheading"
            initialValue={faqheading}
            label="FAQ Heading"
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="faqsubheading"
            initialValue={faqsubheading}
            label="FAQ Subheading"
          >
            <Input />
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
}

export default AdminFaqs;
