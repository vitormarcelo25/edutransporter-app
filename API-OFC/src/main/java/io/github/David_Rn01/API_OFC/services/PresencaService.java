package io.github.David_Rn01.API_OFC.services;

import io.github.David_Rn01.API_OFC.dto.PresencaDTO;
import io.github.David_Rn01.API_OFC.dto.PresencaRespostaDTO;
import io.github.David_Rn01.API_OFC.model.Aluno;
import io.github.David_Rn01.API_OFC.model.Presenca;
import io.github.David_Rn01.API_OFC.model.Presente;
import io.github.David_Rn01.API_OFC.model.Viagem;
import io.github.David_Rn01.API_OFC.repository.AlunoRepository;
import io.github.David_Rn01.API_OFC.repository.PresencaRepository;
import io.github.David_Rn01.API_OFC.repository.ViagemRepository;
import lombok.ToString;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class PresencaService {

    @Autowired
    private PresencaRepository presencaRepository;

    @Autowired
    private AlunoRepository alunoRepository;

    @Autowired
    private ViagemRepository viagemRepository;

    public PresencaRespostaDTO marcar(PresencaDTO presencaDTO){
        Presenca presenca = new Presenca();

        Aluno aluno = alunoRepository.findByCpf(presencaDTO.getCpfAluno())
                .orElseThrow(() -> new IllegalArgumentException("Aluno não encontrado"));

        Viagem viagem = viagemRepository.findById(presencaDTO.getIdViagem())
                .orElseThrow(() -> new IllegalArgumentException("Viagem não encontrada"));

        presenca.setAluno(aluno);
        presenca.setViagem(viagem);
        presenca.setConfirmadoEm(LocalDateTime.now());
        presenca.setPresente(Presente.PRESENTE);

        presencaRepository.save(presenca);

        return convertResposta(presenca);
    }

    public void desmarcar(Integer id){
        if (!presencaRepository.existsById(id)){
            throw new IllegalArgumentException("Você não está marcado");
        }

        alunoRepository.deleteById(id.toString());
    }

    private PresencaRespostaDTO convertResposta(Presenca presenca){
        PresencaRespostaDTO presencaRespostaDTO = new PresencaRespostaDTO();

        presencaRespostaDTO.setNomeAluno(presenca.getAluno().getNome());
        presencaRespostaDTO.setPresente(presenca.getPresente());
        presencaRespostaDTO.setConfirmadoEm(presenca.getConfirmadoEm());
        presencaRespostaDTO.setDataViagem(presenca.getViagem().getData());

        return presencaRespostaDTO;
    }
}
