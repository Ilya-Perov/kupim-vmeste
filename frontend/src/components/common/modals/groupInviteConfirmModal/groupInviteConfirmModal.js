import React, { useEffect, useState } from "react";
import "./groupInviteConfirmModal.css";

const GroupInviteConfirmModal = ({
  isOpen,
  user,
  group,
  onCancel,
  onConfirm,
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timer;

    if (isOpen) {
      setVisible(true);

      // автозакрытие через 10 секунд
      timer = setTimeout(() => {
        handleClose();
      }, 10000);
    }

    return () => clearTimeout(timer);
  }, [isOpen]);

  const handleClose = () => {
    setVisible(false);

    // даём время анимации перед unmount
    setTimeout(() => {
      onCancel();
    }, 250);
  };

  if (!isOpen && !visible) return null;

  return (
    <div className={`modal-overlay ${visible ? "show" : "hide"}`}>
      <div className={`modal-box ${visible ? "show" : "hide"}`}>
        <h3>📨 Приглашение в группу</h3>

        <p className="modal-text">
          Пользователь <b>{user?.username}</b> будет приглашён в группу{" "}
          <b>{group?.name}</b>.
        </p>

        <p className="modal-hint">
          Через 10 секунд окно закроется автоматически.
        </p>

        <div className="modal-actions">
          <button
            className="btn-primary"
            onClick={() => {
              onConfirm();
              handleClose();
            }}
          >
            Подтвердить
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupInviteConfirmModal;
