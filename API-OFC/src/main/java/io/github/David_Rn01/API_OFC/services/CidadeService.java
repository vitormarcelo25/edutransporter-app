package io.github.David_Rn01.API_OFC.services;

import io.github.David_Rn01.API_OFC.model.Cidade;
import io.github.David_Rn01.API_OFC.repository.CidadeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CidadeService {

    @Autowired
    private CidadeRepository cidadeRepository;

    public Cidade cadastrarCidade(Cidade cidade){
        validar(cidade);
        return cidadeRepository.save(cidade);
    }

    private void validar(Cidade cidade){
        if (cidade.getNome() == null || cidade.getNome().isBlank()) {
            throw new IllegalArgumentException("O nome da cidade é obrigatório");
        }

        if (cidade.getNome().length() > 50){
            throw new IllegalArgumentException("O nome da cidade deve ter no máximo 50 caracteres");
        }

        if (cidade.getEstado() == null || cidade.getEstado().isBlank()){
            throw new IllegalArgumentException("O nome do estado é obrigatório");
        }

        if (cidade.getEstado().length() > 50){
            throw new IllegalArgumentException("O estado deve conter no máximo 50 caracteres");
        }

        boolean jaExiste = cidadeRepository.existsByNomeAndEstado(cidade.getNome(), cidade.getEstado());

        if (jaExiste){
            throw new IllegalArgumentException("Cidade já existente");
        }
    }
}
