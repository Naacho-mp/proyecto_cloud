import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BsClockHistory } from 'react-icons/bs';
//test
const PagoPending = () => {
  const navigate = useNavigate();

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow border-0">
            <div className="card-body text-center py-5">
              <BsClockHistory size={80} className="text-warning mb-4" />
              <h2 className="fw-bold text-warning">Pago Pendiente</h2>
              <p className="lead text-muted mt-3">
                Tu transacción se encuentra en proceso de validación.
              </p>
              <div className="alert alert-warning mt-4">
                Esto puede ocurrir con transferencias bancarias o métodos de pago que no son instantáneos. Te avisaremos por correo cuando se confirme.
              </div>
              <button 
                className="btn btn-primary btn-lg mt-4 px-5"
                onClick={() => navigate('/productos')}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PagoPending;
