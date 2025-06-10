const LanguageTabs = ({ activeTab, setActiveTab }) => {
    return (
      <div className="language-tabs">
        {["es", "en", "fr"].map((lang) => (
          <button
            key={lang}
            className={activeTab === lang ? "active" : ""}
            onClick={() => setActiveTab(lang)}
          >
            {lang.toUpperCase()}
          </button>
        ))}
      </div>
    );
  };
  
  export default LanguageTabs;
  
  