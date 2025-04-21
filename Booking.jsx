import { GlobalContext } from '@/component/GlobalStore/GlobalState';
import React, { useContext, useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import Pending from './messageComponemts/Pending';
import Histroy from './messageComponemts/histroy';
import { sessionApi } from '@/lib/api';

function Booking() {
  const { upDatePage, handleToggleState } = useContext(GlobalContext);
  const [components, setComponents] = useState('Pending');
  const [pendingSessions, setPendingSessions] = useState([]);
  const [historySessions, setHistorySessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true);
      setError(null);
      try {
        if (components === 'Pending') {
          const response = await sessionApi.getAll();
          setPendingSessions(response.data);
        } else {
          const response = await sessionApi.getHistory();
          setHistorySessions(response.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch sessions');
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [components]);

  const changeStateToPending = () => {
    setComponents('Pending');
  };

  const changeStateToHistory = () => {
    setComponents('History');
  };

  const displayComponent = () => {
    if (loading) {
      return <div className="text-center py-4">Loading...</div>;
    }

    if (error) {
      return <div className="text-red-500 text-center py-4">{error}</div>;
    }

    switch (components) {
      case 'Pending':
        return <Pending sessions={pendingSessions} />;
      case 'History':
        return <Histroy sessions={historySessions} />;
      default:
        return <div>No component found</div>;
    }
  };

  return (
    <section className="p-3 md:p-0">
      {/* Header Section */}
      <header className="flex justify-between">
        <div className="flex flex-col w-full lg:flex-row justify-start items-start lg:items-center gap-4 lg:gap-0 lg:justify-between">
          <div className="flex flex-col gap-4">
            <h1 className="text-[32px] font-medium">Bookings</h1>
            <p className="text-base font-medium text-slate-600">Easy Communication with everyone</p>
          </div>

          <div className="flex justify-center gap-4">
            <img
              onClick={() => upDatePage('Message')}
              src="/image/messageIcon.png"
              className="md:w-12 h-9 md:h-12 cursor-pointer"
              alt="Message Icon"
              loading="lazy"
            />
            <img
              onClick={() => upDatePage('Setting')}
              src="/image/settingIcon.png"
              className="md:w-12 h-9 md:h-12 cursor-pointer"
              alt="Setting Icon"
              loading="lazy"
            />
          </div>
        </div>
        <div onClick={handleToggleState} className="block lg:hidden mt-3">
          <button>
            <FontAwesomeIcon icon={faBars} />
          </button>
        </div>
      </header>

      <main className="mt-14">
        <div className="p-2 bg-white w-fit flex items-center gap-2 rounded-md cursor-pointer">
          <button
            onClick={changeStateToPending}
            className={`h-10 w-28 rounded-md text-black font-semibold transition-colors duration-300 ${
              components === 'Pending' ? 'bg-customOrange text-white' : 'bg-slate-200'
            }`}
          >
            Pending
          </button>
          <button
            onClick={changeStateToHistory}
            className={`h-10 w-28 rounded-md text-black font-semibold transition-colors duration-300 ${
              components === 'History' ? 'bg-customOrange text-white' : 'bg-slate-200'
            }`}
          >
            History
          </button>
        </div>

        <section className="w-full bg-slate-100 mt-4 p-4 rounded-lg">
          {displayComponent()}
        </section>
      </main>
    </section>
  );
}

export default Booking; 