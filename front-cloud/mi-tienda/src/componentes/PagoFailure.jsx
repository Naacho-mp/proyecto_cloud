import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BsXCircle } from 'react-icons/bs';

const PagoFailure = () => {
  const navigate = useNavigate();

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow border-0">
            <div className="card-body text-center py-5">
              <BsXCircle size={80} className="text-danger mb-4" />
              <h2 className="fw-bold text-danger">Pago Fallido</h2>
              <p className="lead text-muted mt-3">
                Lo sentimos, no pudimos procesar tu pago en este momento.
              </p>
              <div className="alert alert-danger mt-4">
                Puede que tu tarjeta haya sido rechazada o la transacción haya sido cancelada por el usuario.
              </div>
              <div className="d-grid gap-2 mt-4">
                <button 
                  className="btn btn-primary btn-lg px-5"
                  onClick={() => navigate('/productos')}
                >
                  Intentar de Nuevo
                </button>
                <button 
                  className="btn btn-outline-secondary"
                  onClick={() => navigate('/productos')}
                >
                  Volver al Catálogo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PagoFailure;
