package io.github.David_Rn01.API_OFC.services;

import io.github.David_Rn01.API_OFC.dto.MotoristaVeiculoDTO;
import io.github.David_Rn01.API_OFC.model.Motorista;
import io.github.David_Rn01.API_OFC.model.MotoristaVeiculo;
import io.github.David_Rn01.API_OFC.model.Veiculo;
import io.github.David_Rn01.API_OFC.repository.MotoristaRepository;
import io.github.David_Rn01.API_OFC.repository.MotoristaVeiculoRepository;
import io.github.David_Rn01.API_OFC.repository.VeiculoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
public class MotoristaVeiculoService {

    @Autowired
    private MotoristaVeiculoRepository motoristaVeiculoRepository;

    @Autowired
    private VeiculoRepository veiculoRepository;

    @Autowired
    private MotoristaRepository motoristaRepository;

    public MotoristaVeiculo criar(MotoristaVeiculoDTO motoristaVeiculoDTO){
        MotoristaVeiculo motoristaVeiculo1 = new MotoristaVeiculo();

        Motorista motorista = motoristaRepository.findByNomeIgnoreCase(motoristaVeiculoDTO.getNomeMotorista())
                .orElseThrow(() -> new IllegalArgumentException("Motorista não encontrado"));

        Veiculo veiculo = veiculoRepository.findByPlacaIgnoreCase(motoristaVeiculoDTO.getPlacaVeiculo())
                .orElseThrow(() -> new IllegalArgumentException("Veiculo não encontrado"));

        motoristaVeiculo1.setMotorista(motorista);
        motoristaVeiculo1.setVeiculo(veiculo);
        motoristaVeiculo1.setDataAtribuicao(LocalDate.now());

        return motoristaVeiculoRepository.save(motoristaVeiculo1);
    }
}
