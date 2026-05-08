import React, { useState } from "react";
import { api } from "../../api";
import "./userAutocomplete.css";

const UserAutocomplete = ({ onSelect }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);

  const handleSearch = async (value) => {
    setQuery(value);

    if (value.length < 2) {
      setResults([]);
      return;
    }

    try {
      const data = await api.searchUsers(value);
      setResults(data || []);
      setOpen(true);
    } catch (err) {
      console.error("User search error:", err);
      setResults([]);
    }
  };

  const selectUser = (user) => {
    onSelect(user);
    setQuery("");
    setResults([]);
    setOpen(false);
  };

  return (
    <div className="autocomplete">
      <input
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Введите username"
        onFocus={() => setOpen(true)}
      />

      {open && results.length > 0 && (
        <div className="dropdown">
          {results.map((user) => (
            <div
              key={user.id}
              className="dropdown-item"
              onClick={() => selectUser(user)}
            >
              👤 {user.username}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserAutocomplete;
