package io.github.David_Rn01.API_OFC.services;

import io.github.David_Rn01.API_OFC.dto.LoginDTO;
import io.github.David_Rn01.API_OFC.dto.MotoristaDTO;
import io.github.David_Rn01.API_OFC.dto.MotoristaRespostaDTO;
import io.github.David_Rn01.API_OFC.model.Cidade;
import io.github.David_Rn01.API_OFC.model.Motorista;
import io.github.David_Rn01.API_OFC.model.Veiculo;
import io.github.David_Rn01.API_OFC.repository.CidadeRepository;
import io.github.David_Rn01.API_OFC.repository.MotoristaRepository;
import io.github.David_Rn01.API_OFC.repository.VeiculoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class MotoristaService {

    @Autowired
    private MotoristaRepository motoristaRepository;

    @Autowired
    private VeiculoRepository veiculoRepository;

    @Autowired
    private CidadeRepository cidadeRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public MotoristaRespostaDTO cadastrar(MotoristaDTO motoristaDTO){
        validar(motoristaDTO);

        Cidade cidade = cidadeRepository.findByNomeIgnoreCaseAndEstadoIgnoreCase(motoristaDTO.getNomeCidade(), motoristaDTO.getNomeEstado())
                .orElseThrow(() -> new IllegalArgumentException("Cidade não encontrada"));

        String senhaCriptografada = passwordEncoder.encode(motoristaDTO.getSenha());

        Motorista motorista = new Motorista(
                motoristaDTO.getCpf(),
                motoristaDTO.getNome(),
                motoristaDTO.getNumeroCelular(),
                senhaCriptografada,
                motoristaDTO.getCarteiraConducao(),
                cidade
        );

        motoristaRepository.save(motorista);

        return converterResposta(motoristaDTO);
    }

    public boolean Login(LoginDTO loginDTO){
        Motorista motorista = motoristaRepository.findByCpf(loginDTO.getCpf()).orElseThrow(() -> new IllegalArgumentException("Motorista não encontrado"));
        if (motorista == null) {
            return false;
        }

        return passwordEncoder.matches(loginDTO.getSenha(), motorista.getSenha());
    }

    //Terminar as validações
    private void validar(MotoristaDTO motoristaDTO){
        if (motoristaDTO.getCpf() == null || motoristaDTO.getCpf().isBlank()){
            throw new IllegalArgumentException("O CPF precisa estar preenchido");
        }

        boolean jaExiste = motoristaRepository.existsByCarteiraConducao(motoristaDTO.getCarteiraConducao());
        if (jaExiste){
            throw new IllegalArgumentException("Motorista já está cadastrado");
        }

        if (motoristaDTO.getNome() == null || motoristaDTO.getNome().isBlank()){
            throw new IllegalArgumentException("Nome é obrigatório");
        }
    }

    private void excluir(String cpf){
        if (!motoristaRepository.existsByCpf(cpf)){
            throw new IllegalArgumentException("Motorista inexistente");
        }

        motoristaRepository.deleteById(cpf);
    }

    private MotoristaRespostaDTO converterResposta(MotoristaDTO motoristaDTO){
        return new MotoristaRespostaDTO(
                motoristaDTO.getNome(),
                motoristaDTO.getNumeroCelular(),
                motoristaDTO.getCarteiraConducao(),
                motoristaDTO.getNomeCidade()
        );
    }
}
