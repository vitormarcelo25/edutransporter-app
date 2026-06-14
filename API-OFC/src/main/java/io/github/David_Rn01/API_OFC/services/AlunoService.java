package io.github.David_Rn01.API_OFC.services;

import io.github.David_Rn01.API_OFC.dto.AlunoDTO;
import io.github.David_Rn01.API_OFC.dto.AlunoRespostaDTO;
import io.github.David_Rn01.API_OFC.dto.LoginDTO;
import io.github.David_Rn01.API_OFC.model.Aluno;
import io.github.David_Rn01.API_OFC.model.Cidade;
import io.github.David_Rn01.API_OFC.model.Faculdade;
import io.github.David_Rn01.API_OFC.repository.AlunoRepository;
import io.github.David_Rn01.API_OFC.repository.CidadeRepository;
import io.github.David_Rn01.API_OFC.repository.FaculdadeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AlunoService {

    @Autowired
    private AlunoRepository alunoRepo;

    @Autowired
    private CidadeRepository cidadeRepo;

    @Autowired
    private FaculdadeRepository faculdadeRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public AlunoRespostaDTO cadastrar(AlunoDTO alunoDTO){
        validar(alunoDTO);

        Cidade cidade = cidadeRepo
                .findByNomeIgnoreCaseAndEstadoIgnoreCase(alunoDTO.getNomeCidade(), alunoDTO.getNomeEstado())
                .orElseThrow(() -> new IllegalArgumentException("cidade não encontrada"));

        Faculdade faculdade = faculdadeRepo
                .findByNomeIgnoreCase(alunoDTO.getNomeFaculdade())
                .orElseThrow(() -> new IllegalArgumentException("Faculdade não encontrada nessa cidade"));

        String senhaCriptografada = passwordEncoder.encode(alunoDTO.getSenha());

        Aluno aluno = new Aluno(
                alunoDTO.getCpf(),
                alunoDTO.getNome(),
                alunoDTO.getNumeroCelular(),
                senhaCriptografada,
                cidade,
                faculdade
        );

        Aluno alunoSalvo = alunoRepo.save(aluno);

        return transformarDTO(alunoSalvo);
    }

    public void excluir(String cpf){
        if (!alunoRepo.existsByCpf(cpf)){
            throw new IllegalArgumentException("Aluno não encontrado");
        }

        alunoRepo.deleteById(cpf);
    }

    public boolean login(LoginDTO loginDTO){
        Aluno aluno = alunoRepo.findByCpf(loginDTO.getCpf()).orElseThrow(()-> new IllegalArgumentException("Aluno não encontrado"));

        if (aluno == null) {
            return false;
        }

        return passwordEncoder.matches(loginDTO.getSenha(), aluno.getSenha());
    }

    private void validar(AlunoDTO alunoDTO){
        boolean jaExiste = alunoRepo.existsByCpf(alunoDTO.getCpf());
        if(jaExiste){
            throw new IllegalArgumentException("Este CPF já está cadastrado");
        }

        if (alunoDTO.getCpf() == null || alunoDTO.getCpf().isBlank()){
            throw new IllegalArgumentException("O campo CPF deve estar preenchido");
        }

        if (alunoDTO.getCpf().length() != 17){
            throw new IllegalArgumentException("O CPF não foi inserido corretamente");
        }

        if (alunoDTO.getNumeroCelular() == null || alunoDTO.getNumeroCelular().isBlank()){
            throw new IllegalArgumentException("O numero deve ser preenchido");
        }

        if (alunoDTO.getNumeroCelular().length() != 16) {
            throw new IllegalArgumentException("O numero de celular não foi inserido corretamente");
        }

        if(alunoDTO.getNome() == null || alunoDTO.getNome().isBlank()){
            throw new IllegalArgumentException("O campo nome deve conter no maximo 50 caracteres");
        }

        if (alunoDTO.getNome().length() > 50){
            throw new IllegalArgumentException("O campo deve ter no máximo 50 caracteres");
        }

        if (alunoDTO.getSenha() == null || alunoDTO.getSenha().isBlank()){
            throw new IllegalArgumentException("O campo senha deve estar preenchido");
        }

        if (alunoDTO.getSenha().length() < 8 || alunoDTO.getSenha().length() > 25){
            throw new IllegalArgumentException("A senha deve conter entre 8 e 25 caracteres");
        }

        if(alunoDTO.getNomeEstado() == null || alunoDTO.getNomeEstado().isBlank()){
            throw new IllegalArgumentException("O estado deve estar preenchido");
        }

        if (alunoDTO.getNomeCidade() == null || alunoDTO.getNomeCidade().isBlank()){
            throw new IllegalArgumentException("O campo cidade deve ser preenchido");
        }

        if (alunoDTO.getNomeFaculdade() == null || alunoDTO.getNomeFaculdade().isBlank()){
            throw new IllegalArgumentException("O campo faculdade deve ser preenchido");
        }
    }

    private AlunoRespostaDTO transformarDTO(Aluno aluno){
        AlunoRespostaDTO retorno = new AlunoRespostaDTO();

        retorno.setNome(aluno.getNome());
        retorno.setNumero_celular(aluno.getNumeroCelular());
        retorno.setNomeCidade(aluno.getCidade().getNome());
        retorno.setNomeEstado(aluno.getCidade().getEstado());
        retorno.setNomeFaculdade(aluno.getFaculdade().getNome());

        return retorno;
    }
}
