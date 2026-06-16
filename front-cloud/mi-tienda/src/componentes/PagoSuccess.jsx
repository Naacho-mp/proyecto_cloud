import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BsCheckCircle } from 'react-icons/bs';

const PagoSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow border-0">
            <div className="card-body text-center py-5">
              <BsCheckCircle size={80} className="text-success mb-4" />
              <h2 className="fw-bold text-success">¡Pago Exitoso!</h2>
              <p className="lead text-muted mt-3">
                Tu transacción ha sido procesada correctamente.
              </p>
              <div className="alert alert-success mt-4">
                Hemos recibido tu pedido y pronto recibirás un correo con el detalle.
              </div>
              <button 
                className="btn btn-primary btn-lg mt-4 px-5"
                onClick={() => navigate('/productos')}
              >
                Volver a la Tienda
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PagoSuccess;
