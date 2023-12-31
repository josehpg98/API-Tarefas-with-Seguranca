import { useState, useEffect } from "react";
import TarefaContext from "./TarefaContext";
import Tabela from "./Tabela";
import Form from "./Form";
import Carregando from "../../comuns/Carregando";

function Tarefa() {

    let navigate = useNavigate();
    const [alerta, setAlerta] = useState({ status: "", message: "" });
    const [listaObjetos, setListaObjetos] = useState([]);
    const [editar, setEditar] = useState(false);
    const [objeto, setObjeto] = useState({
        codigo: "", titulo: "",
        descricao: "", pessoa : ""
    });
    const [listaPessoas, setListaPessoas] = useState([]);
    const [carregando, setCarregando] = useState(true);

    const recuperar = async codigo => {
        await fetch(`${process.env.REACT_APP_ENDERECO_API}/tarefas/${codigo}`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "x-access-token": Autenticacao.pegaAutenticacao().token
            }
        })
        .then(response => response.json())
        .then(data => setObjeto(data))
        .catch(err => setAlerta({ status: "error", message: err }));
    }

    const acaoCadastrar = async e => {
        e.preventDefault();
        const metodo =  editar ? "PUT" : "POST";
        try {
            await fetch(`${process.env.REACT_APP_ENDERECO_API}/tarefas`,
            {
                method: metodo,
                headers: {
                    "Content-Type": "application/json",
                    "x-access-token": Autenticacao.pegaAutenticacao().token
                },
                body: JSON.stringify(objeto)
            }).then(response => response.json())
            .then(json => {
                setAlerta({status : json.status, message : json.message});
                setObjeto(json.objeto);
                if (!editar){
                    setEditar(true);
                }
            })
        } catch(err){
            setAlerta({ status: "error", message: err })
        }
        recuperaTarefas();
    }

    const handleChange = (e) => {
        const name = e.target.name;
        const value = e.target.value;
        setObjeto({...objeto, [name] : value});
    }

    const recuperaTarefas = async () => {
    try {
        setCarregando(true);
        await fetch(`${process.env.REACT_APP_ENDERECO_API}/tarefas`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "x-access-token": Autenticacao.pegaAutenticacao().token
            }
        })
            .then(response => response.json())
            .then(data => setListaObjetos(data))
            .catch(err => setAlerta({ status: "error", message: err }));
        setCarregando(false);
    } catch (err) {
        window.location.reload();
        navigate("/login", { replace: true });
    }
    }    
 
    const recuperaPessoas = async () => {
            try {
                await fetch(`${process.env.REACT_APP_ENDERECO_API}/pessoas`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            "x-access-token": Autenticacao.pegaAutenticacao().token
                        }
                    })
                    .then(response => response.json())
                    .then(data => setListaPessoas(data))
                    .catch(err => setAlerta({ status: "error", message: err }))
            } catch (err) {
                window.location.reload();
                navigate("/login", { replace: true });
            }
    }

    const remover = async objeto => {
        if (window.confirm('Deseja remover este objeto?')) {
            try {
                await
                    fetch(`${process.env.REACT_APP_ENDERECO_API}/tarefas/${objeto.codigo}`,
                        {
                            method: "DELETE",
                            headers: {
                                "Content-Type": "application/json",
                                "x-access-token": Autenticacao.pegaAutenticacao().token
                            }
                        })
                        .then(response => response.json())
                        .then(json => setAlerta({ status: json.status, message: json.message }))
                    recuperaTarefas();
            } catch (err) {
                window.location.reload();
                navigate("/login", { replace: true });
            }
        }
    }

    useEffect(() => {
        recuperaTarefas();
        recuperaPessoas();
    }, []);

    return (
        <TarefaContext.Provider value={{
            alerta, setAlerta,
            listaObjetos, setListaObjetos,
            recuperaPessoas, remover,
            objeto, setObjeto,
            editar, setEditar, 
            recuperar, acaoCadastrar, 
            handleChange, listaPessoas
        }}>
             { !carregando ? <Tabela /> : <Carregando/> }
            <Form/>
        </TarefaContext.Provider>
    )

}

export default WithAuth(Tarefa);