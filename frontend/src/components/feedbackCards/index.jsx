import React from "react";

const FeedbackCard = (column) => {
  console.log("objectobjectobjectobjectobject", column);
  return (
    <div className="flex flex-col space-y-6">
      {column.column.map((user, userIndex) => (
        <div
          key={userIndex}
          className="bg-glass shadow-md p-6 flex flex-col space-y-4 rounded-feedbackCardRadius"
          style={{
            borderRadius: "24px 24px 24px 4px",
          }}
        >
          <p className="text-primary text-lg font-normal">{user.description}</p>
          <div className="flex gap-2 items-center">
            <div>
              <img
                src={user.userImage}
                alt={user.userName}
                className="w-12 h-12 rounded-full object-cover"
                loading="lazy"
              />
            </div>
            <div>
              <h2 className="text-sm font-medium">{user.userName}</h2>
              <p className="text-xs font-normal text-lightGrey">
                {user.userEmail}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FeedbackCard;
