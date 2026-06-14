package io.github.David_Rn01.API_OFC.services;

import io.github.David_Rn01.API_OFC.dto.ViagemDTO;
import io.github.David_Rn01.API_OFC.model.Motorista;
import io.github.David_Rn01.API_OFC.model.Veiculo;
import io.github.David_Rn01.API_OFC.model.Viagem;
import io.github.David_Rn01.API_OFC.repository.MotoristaRepository;
import io.github.David_Rn01.API_OFC.repository.VeiculoRepository;
import io.github.David_Rn01.API_OFC.repository.ViagemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;

@Service
public class ViagemService {

    @Autowired
    private MotoristaRepository motoristaRepository;

    @Autowired
    private VeiculoRepository veiculoRepository;

    @Autowired
    private ViagemRepository viagemRepository;

    public Viagem cadastrar(ViagemDTO viagemDTO){
        validar(viagemDTO);

        Veiculo veiculo = veiculoRepository.findByPlacaIgnoreCase(viagemDTO.getVeiculoPlaca()).orElseThrow(() -> new IllegalArgumentException("Placa não encontrada"));

        Motorista motorista = motoristaRepository.findByNomeIgnoreCase(viagemDTO.getMotoristaNome())
                .orElseThrow(() -> new IllegalArgumentException("Motorista não encontrado"));

        Viagem novaViagem = new Viagem();

        novaViagem.setTipoViagem(viagemDTO.getTipo());
        novaViagem.setData(LocalDate.now());
        novaViagem.setHorario(LocalTime.now());
        novaViagem.setMotorista(motorista);
        novaViagem.setVeiculo(veiculo);
        novaViagem.setNomeRota(viagemDTO.getRota());

        return viagemRepository.save(novaViagem);
    }

    private void validar(ViagemDTO viagemDTO){
        if (viagemDTO == null){
            throw new IllegalArgumentException("Dados incompletos");
        }
    }
}

