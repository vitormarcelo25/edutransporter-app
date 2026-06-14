package io.github.David_Rn01.API_OFC.repository;

import io.github.David_Rn01.API_OFC.model.Motorista;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface MotoristaRepository extends JpaRepository<Motorista, String> {
    Optional<Motorista> findByNomeIgnoreCase(String nome);
    Optional<Motorista> findByCpf(String spf);
    boolean existsByCarteiraConducao(String number);
    boolean existsByCpf(String cpf);
}
