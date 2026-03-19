import React from 'react';
import './familyGroup.css';

const FamilyGroup = () => {
  const familyMembers = [
    { name: 'Анна', avatar: '👩', items: 2 },
    { name: 'Алексей', avatar: '👨', items: 1 },
    { name: 'Миша', avatar: '👦', items: 3 },
    { name: 'Катя', avatar: '👧', items: 0 }
  ];

  return (
    <div className="family-group-widget">
      <div className="family-group-header">
        <h3>Семейная группа</h3>
        <span className="member-count">{familyMembers.length} участника</span>
      </div>
      
      <div className="family-progress">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: '75%' }}></div>
        </div>
        <span className="progress-text">Общая корзина: 6 товаров</span>
      </div>
      
      <div className="family-members-list">
        {familyMembers.map((member, index) => (
          <div key={index} className="member-item">
            <div className="member-info">
              <span className="member-avatar">{member.avatar}</span>
              <span className="member-name">{member.name}</span>
            </div>
            <span className="member-items">{member.items} товаров</span>
          </div>
        ))}
      </div>
      
      <button className="view-family-cart-btn">
        Просмотреть общую корзину →
      </button>
    </div>
  );
};

export default FamilyGroup;