package io.github.David_Rn01.API_OFC.services;

import io.github.David_Rn01.API_OFC.dto.FaculdadeDTO;
import io.github.David_Rn01.API_OFC.model.Cidade;
import io.github.David_Rn01.API_OFC.model.Faculdade;
import io.github.David_Rn01.API_OFC.repository.CidadeRepository;
import io.github.David_Rn01.API_OFC.repository.FaculdadeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class FaculdadeService {

    @Autowired
    private FaculdadeRepository faculdadeRepository;

    @Autowired
    private CidadeRepository cidadeRepository;


    public Faculdade cadastrar(FaculdadeDTO faculdadeDto){
        validar(faculdadeDto);

        Cidade cidade = cidadeRepository
                .findByNomeIgnoreCaseAndEstadoIgnoreCase(faculdadeDto.getNomeCidade(), faculdadeDto.getNomeEstado()).orElseThrow(() -> new IllegalArgumentException("Cidade não encontrada"));

        Faculdade faculdade = new Faculdade();

        faculdade.setNome(faculdadeDto.getNome());
        faculdade.setCidade(cidade);
        faculdade.setEndereco(faculdadeDto.getEndereco());

        return faculdadeRepository.save(faculdade);
    }

    private void validar(FaculdadeDTO faculdadeDTO) {
        if (faculdadeDTO == null || faculdadeDTO.getNome().isBlank()){
            throw new IllegalArgumentException("O nome deve ser preenchido");
        }

        if (faculdadeDTO.getNome().length() > 100){
            throw new IllegalArgumentException("O nome deve conter no máximo 100 caracteres");
        }

        if (faculdadeDTO.getEndereco() == null || faculdadeDTO.getEndereco().isBlank()){
            throw new IllegalArgumentException("O endereço deve ser preenchido corretamente");
        }

        if (faculdadeDTO.getEndereco().length() > 150){
            throw new IllegalArgumentException("O campo deve possuir no máximo 150 caracteres");
        }

        if (faculdadeDTO.getNomeCidade() == null || faculdadeDTO.getNomeCidade().isBlank()){
            throw new IllegalArgumentException("O campo nome da cidade deve ser preenchido");
        }

        if (faculdadeDTO.getNomeEstado() == null || faculdadeDTO.getNomeEstado().isBlank()) {
            throw new IllegalArgumentException("O campo Estado deve estar preenchido");
        }
    }
}
