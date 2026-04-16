import React, { useState, useEffect } from 'react';
import './familyGroup.css';

const FamilyGroup = () => {
  const [familyMembers, setFamilyMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFamilyData();
    
    const handleCartUpdate = () => loadFamilyData();
    window.addEventListener('cartUpdated', handleCartUpdate);
    
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, []);

  const loadFamilyData = async () => {
    try {
      // Только относительные пути!
      const membersRes = await fetch('/api/family-members');
      if (!membersRes.ok) throw new Error('Failed to load family members');
      const members = await membersRes.json();
      setFamilyMembers(members);
      
      const totalRes = await fetch('/api/cart/total');
      if (!totalRes.ok) throw new Error('Failed to load cart total');
      const total = await totalRes.json();
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading family data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="family-group-widget">Загрузка...</div>;
  }

  const totalItemsInCart = familyMembers.reduce((sum, m) => sum + (m.items_count || 0), 0);

  return (
    <div className="family-group-widget">
      <div className="family-group-header">
        <h3>Семейная группа</h3>
        <span className="member-count">{familyMembers.length} участника</span>
      </div>
      
      <div className="family-progress">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${Math.min(100, (totalItemsInCart / 10) * 100)}%` }}></div>
        </div>
        <span className="progress-text">Общая корзина: {totalItemsInCart} товаров</span>
      </div>
      
      <div className="family-members-list">
        {familyMembers.map((member, index) => (
          <div key={index} className="member-item">
            <div className="member-info">
              <span className="member-avatar">{member.avatar || '👤'}</span>
              <span className="member-name">{member.name}</span>
            </div>
            <span className="member-items">{member.items_count || 0} товаров</span>
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