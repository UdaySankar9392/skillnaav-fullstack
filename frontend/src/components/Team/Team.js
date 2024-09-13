import React, { useState } from "react";
import Slider from "react-slick";
import Modal from "react-modal";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import linkedin from "../../assets/linkedin_blue.png";
import { useSelector } from "react-redux";

const NextArrow = (props) => {
  const { onClick } = props;
  return (
    <div
      className="absolute top-1/2 right-4 transform -translate-y-1/2 z-10 cursor-pointer bg-green-300 text-white p-2 rounded-full shadow-lg hover:bg-green-400 transition duration-300"
      onClick={onClick}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        className="w-6 h-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M9 5l7 7-7 7"
        />
      </svg>
    </div>
  );
};

const PrevArrow = (props) => {
  const { onClick } = props;
  return (
    <div
      className="absolute top-1/2 left-4 transform -translate-y-1/2 z-10 cursor-pointer bg-green-300 text-white p-2 rounded-full shadow-lg hover:bg-green-400 transition duration-300"
      onClick={onClick}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        className="w-6 h-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M15 19l-7-7 7-7"
        />
      </svg>
    </div>
  );
};

const Team = ({className}) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const { skillnaavData } = useSelector((state) => state.root);

  const openModal = (member) => {
    setSelectedMember(member);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedMember(null);
  };

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  if (
    !skillnaavData ||
    !skillnaavData.team ||
    skillnaavData.team.length === 0
  ) {
    return (
      <div className="bg-gradient-to-r from-teal-500 to-green-500 py-12 px-4 rounded-lg">
        <p className="text-white text-center">No team members found.</p>
      </div>
    );
  }

  const { teamheading, teamsubheading } = skillnaavData.team[0];
  const teammembers = skillnaavData.teammember;

  return (
    <div
      id="team"
      className="bg-gradient-to-r from-teal-500 to-green-500 py-12 rounded-lg px-4 mt-16 md:mt-8"
    >
      <div className="text-center text-white mb-8">
        <h1 className="text-4xl font-bold mb-4">{teamheading}</h1>
        <p className="text-xl max-w-2xl mx-auto">{teamsubheading}</p>
      </div>
      <Slider {...settings} className="mb-8">
        {teammembers.map((member) => (
          <div key={member._id} className="p-4">
            <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center h-full">
              <div className="w-36 h-36 md:w-44 md:h-44 lg:w-52 lg:h-52 rounded-full overflow-hidden mb-4">
                <img
                  src={member.image}
                  alt={member.teammemberName}
                  className="w-full h-full object-cover"
                />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {member.teammemberName}
              </h2>
              <p className="text-gray-600 mb-2">{member.teammemberDesgn}</p>
              <p className="text-gray-700 text-center mb-4 h-20">
                {member.teammemberDesc.substring(0, 120)}
              </p>
              <button
                onClick={() => openModal(member)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition duration-300 hover:bg-green-700 mt-auto"
              >
                Read More
              </button>
            </div>
          </div>
        ))}
      </Slider>
      {modalIsOpen && selectedMember && (
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          contentLabel="Team Member Details"
          className="fixed inset-0 flex items-center justify-center z-50"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-40"
        >
          <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 md:w-2/3 lg:w-1/2 max-h-full overflow-auto">
            <div className="flex justify-between items-center border-b pb-4 mb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                {selectedMember.teammemberName}
              </h2>
              <button onClick={closeModal} className="text-gray-600 text-xl">
                &times;
              </button>
            </div>
            <div className="flex flex-col items-center mb-4">
              <div className="w-36 h-36 md:w-44 md:h-44 lg:w-52 lg:h-52 rounded-full overflow-hidden mb-4">
                <img
                  src={selectedMember.image}
                  alt={selectedMember.teammemberName}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-gray-700 mb-4">
                {selectedMember.teammemberDesgn}
              </p>
              <p className="text-gray-700 text-center">
                {selectedMember.teammemberDesc}
              </p>
              <button
                onClick={() =>
                  window.open(selectedMember.teammemberLinkedin, "_blank")
                }
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 mt-4 flex items-center"
              >
                <img src={linkedin} alt="LinkedIn" className="w-5 h-5 mr-2" />
                Connect on LinkedIn
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Team;
