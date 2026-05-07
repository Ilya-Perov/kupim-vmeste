import React, { useEffect, useState } from "react";
import "./groupPage.css";
import { api } from "../../api";
import UserAutocomplete from "../common/userAutocomplete";
import GroupInviteConfirmModal from "../common/modals/groupInviteConfirmModal/groupInviteConfirmModal";

const GroupPage = () => {
  const [groups, setGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [loading, setLoading] = useState(true);

  // modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);

  // =====================
  // LOAD GROUPS
  // =====================
  const loadGroups = async () => {
    try {
      const data = await api.getMyGroups();

      const safeGroups = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
          ? data.results
          : [];

      setGroups(safeGroups);

      if (!activeGroup && safeGroups.length > 0) {
        setActiveGroup(safeGroups[0]);
      }
    } catch (e) {
      console.error("Groups load error:", e);
      setGroups([]);
    }
  };

  // =====================
  // LOAD MEMBERS
  // =====================
  const loadMembers = async (groupId) => {
    try {
      const data = await api.getGroupMembers(groupId);
      setMembers(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Members load error:", e);
    }
  };

  useEffect(() => {
    const init = async () => {
      await loadGroups();
      setLoading(false);
    };

    init();
  }, []);

  useEffect(() => {
    if (activeGroup?.id) {
      loadMembers(activeGroup.id);
    }
  }, [activeGroup]);

  // =====================
  // CREATE GROUP
  // =====================
  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;

    try {
      const group = await api.createGroup(newGroupName);

      setGroups((prev) => [...prev, group]);
      setNewGroupName("");
    } catch (e) {
      console.error("Create group error:", e);
    }
  };

  // =====================
  // OPEN INVITE MODAL
  // =====================
  const handleInviteClick = (user) => {
    if (!activeGroup || !user) return;

    setPendingUser(user);
    setModalOpen(true);
  };

  // =====================
  // CONFIRM INVITE
  // =====================
  const confirmInvite = async () => {
    try {
      await api.inviteUser(activeGroup.id, pendingUser.username);

      setModalOpen(false);
      setPendingUser(null);
    } catch (e) {
      console.error("Invite error:", e);
    }
  };

  // =====================
  // CANCEL MODAL
  // =====================
  const cancelInvite = () => {
    setModalOpen(false);
    setPendingUser(null);
  };

  // =====================
  // LOADING
  // =====================
  if (loading) return <div className="loading">Загрузка...</div>;

  return (
    <div className="group-page">
      {/* SIDEBAR */}
      <div className="sidebar">
        <h2>👨‍👩‍👧 Группы</h2>

        <div className="create-group">
          <input
            placeholder="Название группы"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
          />
          <button onClick={handleCreateGroup}>Создать</button>
        </div>

        <div className="group-list">
          {groups.length === 0 && <p className="muted">Нет групп</p>}

          {groups.map((g) => (
            <div
              key={g.id}
              className={`group-item ${
                activeGroup?.id === g.id ? "active" : ""
              }`}
              onClick={() => setActiveGroup(g)}
            >
              {g.name}
            </div>
          ))}
        </div>
      </div>

      {/* MAIN */}
      <div className="main">
        <h1>{activeGroup ? activeGroup.name : "Выберите группу"}</h1>

        {/* INVITE */}
        {activeGroup && (
          <div className="invite-box">
            <h3>📨 Пригласить участника</h3>

            <UserAutocomplete onSelect={handleInviteClick} />
          </div>
        )}

        {/* MEMBERS */}
        <div className="members">
          <h3>👥 Участники</h3>

          {members.length === 0 ? (
            <p className="muted">Нет участников</p>
          ) : (
            members.map((m) => (
              <div key={m.id} className="member">
                👤 {m.username}
              </div>
            ))
          )}
        </div>
      </div>

      {/* MODAL */}
      <GroupInviteConfirmModal
        isOpen={modalOpen}
        user={pendingUser}
        group={activeGroup}
        onCancel={cancelInvite}
        onConfirm={confirmInvite}
      />
    </div>
  );
};

export default GroupPage;
