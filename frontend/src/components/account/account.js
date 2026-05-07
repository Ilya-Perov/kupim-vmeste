import React, { useEffect, useState } from "react";
import { api } from "../../api";
import "./account.css";
import { useAuth } from "../../context/authContext";

const Account = () => {
  const { user } = useAuth();

  const [groups, setGroups] = useState([]);
  const [invites, setInvites] = useState([]);
  const [groupName, setGroupName] = useState("");

  const loadData = async () => {
    try {
      const g = await api.getMyGroups();
      const i = await api.getInvites();

      setGroups(Array.isArray(g) ? g : []);
      setInvites(Array.isArray(i) ? i : []);
    } catch {
      setGroups([]);
      setInvites([]);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateGroup = async () => {
    if (!groupName.trim()) return;

    await api.createGroup(groupName);
    setGroupName("");
    loadData();
  };

  return (
    <div className="account-page">
      <h2>👤 Личный кабинет</h2>

      {/* PROFILE */}
      <div className="card">
        <h3>Профиль</h3>
        <p>
          Имя пользователя: <b>{user?.username}</b>
        </p>
      </div>

      {/* CREATE GROUP */}
      <div className="card">
        <h3>Создать группу</h3>

        <div className="row">
          <input
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Название группы"
          />
          <button onClick={handleCreateGroup}>Создать</button>
        </div>
      </div>

      {/* GROUPS */}
      <div className="card">
        <h3>Мои группы</h3>

        {groups.length === 0 && <p className="muted">У вас пока нет групп</p>}

        {groups.map((g) => (
          <div key={g.id} className="group-item">
            👨‍👩‍👧 {g.name}
          </div>
        ))}
      </div>

      {/* INVITES */}
      <div className="card">
        <h3>Приглашения</h3>

        {invites.length === 0 && <p className="muted">Нет приглашений</p>}

        {invites.map((inv) => (
          <div key={inv.id} className="invite-item">
            <span>
              {inv.group_name} от {inv.sender.username}
            </span>

            <div>
              <button onClick={() => api.acceptInvite(inv.id).then(loadData)}>
                Принять
              </button>

              <button onClick={() => api.declineInvite(inv.id).then(loadData)}>
                Отклонить
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Account;
